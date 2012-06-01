define(['walker', 'text!test/data/basicDataTypes.json'], function(walker, basicDataTypesString){

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

  });
  
});
