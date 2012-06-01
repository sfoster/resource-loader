define(['dollar', 'lang', 'json/ref', 'Promise', 'event', 'entity', 'component', 'sprite'], function($, lang, json, Promise, event, Entity, Component, Sprite){

  function get(url, callback){
    console.log("get url: ", url);
    $.ajax({
      url: url,
      dataType: 'json',
      success: callback,
      error: function(err){
        console.error("Error loading " + url, err);
      }
    });
  }
  
  function ResourceQueue(){
    this._ids = {}; 
    this.pendingCount = 0;
  }
  ResourceQueue.create = function(args){
    return new ResourceQueue(args);
  };
  
  lang.mixin(ResourceQueue.prototype, event.Evented, {
    add: function(resourceId, obj, pname, loadNow){
      var self = this, 
          pairs = this._ids[resourceId];
      if(pairs) {
        pairs.push(obj, pname);
      } else {
        pairs = this._ids[resourceId] = [obj, pname]; // tuple of obj, name keyed by resource id
        this.pendingCount++;
        if(loadNow){
          this._loadResource(resourceId);
        }
      }
    },
    loadAll: function(cb){
      var options = { silent: true }, 
          self = this;
      var loadHandle = this.listen('load', function(evt){
        if(!evt.pending){
          if(cb) cb();
          self.emit('loadAll', { pending: 0 });
        }
      });
      for(var resourceId in this._ids){
        this._loadResource(resourceId, options);
      }
    },
    _loadResource: function(resourceId, options){
      console.log("_loadResource, loading ", resourceId);
      options = options || {};
      var idMap = this._ids, self = this;
      var promise = require([resourceId], function(res){
        self.pendingCount--;
        var obj, pname, pair = idMap[resourceId];
        while((obj=pair.shift()) && (pname=pair.shift())){
          obj[pname] = res;
        }
        delete idMap[resourceId];
        self.emit('load', { resource: res, id: resourceId, pending: self.pendingCount });
      });
    }
});
  
  function _createSpriteFromData(data, level){
    console.log("create sprite from: ", data);
    // apply any delegates to the state data
    data.state = lang.map(data.state || {}, function(state, name){
      if(name.indexOf('__') === 0) return lang.map.undef;
      var proto = state.$delegate;
      if(proto) {
        delete state.$delegate;
        state = lang.createObject(proto, state);
      }
      if(typeof state.img == 'string'){
        level.resourceLoader.add('image!'+state.img, state, 'img');
      }
      return state;
    });
    
    var sprite = Sprite.create(data);
    console.log("created sprite: ", sprite);
    return sprite;
  }
  function _createEntityFromData(data, level){
    // apply any delegates to the state data
    var proto = data.$delegate;
    if(proto) {
      delete state.$delegate;
      data = lang.createObject(proto, data);
    }
    
    var ent = Entity.create(data);
    ent.parent = level;
    var components = ent.components; 
    if(components && components.length){
      for(var i=0, comp; i<components.length; i++){
        if('string' == typeof components[i]) {
          comp = Component.get(components[i]);
          if(comp){
            level.needsInit[ components[i] ] = comp;
          } else {
            level.resourceLoader.add('components/'+components[i], level.needsInit, components[i]);
          }
        } else { 
          console.error("Expected component name as string in components list, got: ", components[i]);
          throw "What component is this? " + components[i];
        }
      }
    }
    
    ent.toJSON = function(){
      return json.toJson(this, true);
    };
    console.log("created entity: ", ent);
    level.needsInit[ ent.id ] = ent;
    return ent;
  }
  
  function walkLevelData(data) {
    var resourceLoader = ResourceQueue.create(), 
        level = json.resolveJson(data ), 
        i;
    level.resourceLoader = resourceLoader;
    level.needsInit = {};

    // create sprites
    if(level.sprites){
      for(i=0; i<level.sprites.length; i++) {
        level.sprites[i] = _createSpriteFromData( level.sprites[i], level );
      }
    }
    // create components
    var levelComponents = {};
    
    // create entities
    if(level.entities){
      for(i=0; i<level.entities.length; i++) {
        level.entities[i] = _createEntityFromData( level.entities[i], level );
      }
    }
    
    level.init = function(){
      var initMap = level.needsInit;
      for(var id in initMap){
        if(initMap[id].init) initMap[id].init();
      }
      level.needsInit = null;
    };
    
    level.ready = function(){
      console.log("level.ready");
      var readyPromise = level.readyPromise;
      if(!level.resourceLoader.pendingCount) {
        console.log("level.ready: Nothing loading, returning level");
        return level;
      }
      if(readyPromise){
        console.log("level.ready: loading in progress, returning promise");
         return readyPromise;
      } else {
        readyPromise = level.readyPromise =  new Promise();
        var loadHandle = level.resourceLoader.listen('load', function(){
          console.log("resourceLoader load, pending: ", level.resourceLoader.pendingCount);
          if(level.resourceLoader.pendingCount <= 0){
            loadHandle.remove();
            console.log("resources all loaded, resolving readyPromise");
            readyPromise.resolve(level);
          }
        });
        console.log("level.ready: resourceLoader.load hooked, returning promise");
        return readyPromise;
      }
    };
    
    level.resourceLoader.loadAll( level.ready );
    return data;
  }
  //API
  return {
    load : function(name, req, onLoad, config) {
      if(config.isBuild){
        onLoad(null); //we want to load the resource at runtime, not inline during build
      }else{
        get(req.toUrl(name), function(data){
          var level = walkLevelData( data );
          onLoad( level );
        });
      }
    }
  };
  
});