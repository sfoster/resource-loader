/** @license
 * RequireJS plugin for loading JSON files *at runtime only*
 * Author: Sam Foster
 * Version: 0.1.0 (2012/03/13)
 * Released under the MIT license
 */
define(function(){

  function get(url, callback){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function (evt) {
        //Do not explicitly handle errors, those should be
        //visible via console output in the browser.
        if (xhr.readyState === 4) {
            callback(xhr.responseText);
        }
    };
    xhr.send(null);
  }

    //API
    return {
        load : function(name, req, onLoad, config) {
          if(config.isBuild){
            onLoad(null); //we want to load the resource at runtime, not inline during build
          }else{
            get(req.toUrl(name), function(data){
              onLoad( JSON.parse(data) );
            });
          }
        }
    };
});