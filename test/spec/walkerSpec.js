define(['walker', 'type', 'text!test/data/basicDataTypes.json'], function(walker, type, basicDataTypesString){
  
  var is = type.is;
  
  describe("Walk", function() {

    it("should instantiate ok", function() {
      expect(walker).toBeDefined();
    });
    
    it("should expose the expected api", function(){
      expect(typeof walker.parse).toBe('function');
    });

    it("should parse a json document", function(){
      var doc, err;
      try{
        doc = walker.parse(basicDataTypesString);
      }catch(e){
        err = e;
      }
      expect(err).toBeFalsy();
      expect(doc).toBeTruthy();
      expect(typeof doc).toBe('object');
    });

    it("should parse basic data types", function(){
      var doc = walker.parse(basicDataTypesString);
      
      expect( type(doc) ).toBe('object');
      expect( type(doc.emptyarray) ).toBe('array');
      expect( type(doc.emptyobject) ).toBe('object');
      expect( type(doc.emptystring) ).toBe('string');
      expect( type(doc.emptynumber) ).toBe('number');
      expect( type(doc.anull) ).toBe('null');
      expect( type(doc.arrayofarrays[0]) ).toBe('array');
      expect( type(doc.arrayofobjects[0]) ).toBe('object');
      expect( type(doc.arrayofprimitives[0]) ).toBe('string');
      expect( type(doc.arrayofprimitives[1]) ).toBe('number');
      expect( type(doc.arrayofprimitives[1]) ).toBe('number');
      
    });
    
    it("applies given schemas", function(){
      var testStr = '{id:"/dog/1",eats:{$ref:"/cat/2"},aTime:"2008-11-07T20:26:17-07:00"}';

      var Dog = function(){}; 
      Dog.prototype = {
        barks:true
      };
      Dog.properties = { 
        aTime: {format:'date-time'}
      };

      var Cat = function(){}; 
      Cat.prototype.meows = true;
      
      var schemas = {
        "/dog/": Dog,
        "/cat/":Cat
      };

      var testObj = walker.parse(testStr,{
        schemas:schemas
      });

      expect(testObj.barks).toBeTruthy();
      expect( type(testObj.aTime) ).toBe('date');
      expect(testObj.eats.meows).toBeTruthy();
      expect(testObj.eats instanceof Cat).toBeTruthy();
    });

  });
  
});
