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

  });
  
});
