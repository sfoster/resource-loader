define(function(undef){
  var empty = {};
  var is = {
    'undefined': function(thing){
      return thing === undef;
    },
    'number': function(thing){
      return 'number' == typeof thing || thing instanceof Number;
    },
    'string': function(thing){
      return 'string' == typeof thing || thing instanceof String;
    },
    'array': function(thing){
      return is.object(thing) && thing instanceof Array;
    },
    'date': function(thing){
      return is.object(thing) && thing instanceof Date;
    },
    'function': function(thing){
      return 'function' == typeof thing;
    },
    'null': function(thing){
      return thing === null;
    },
    'object': function(thing){
      return 'object' == typeof thing;
    }
  };
  
  function type(thing){
    for(var name in is){
      if(name in empty) continue;
      if(is[name](thing)) return name;
    }
    return 'unknown';
  }
  
  type.is = is; 
  
  return type;
});