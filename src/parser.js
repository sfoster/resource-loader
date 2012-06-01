define(['./registry'], function(registry){
  
  // walk a data structure
  // handing each object to registered adapters
  // 
  // adapter can 
  var stack = [], 
      token = null;
      
  function walk(data) {
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

});