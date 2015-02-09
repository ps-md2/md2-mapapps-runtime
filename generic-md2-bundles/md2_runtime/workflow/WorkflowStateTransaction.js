define([
    "dojo/_base/declare", "dojo/topic", "dojo/_base/lang"
],
function(declare, topic, lang) {
    
    return declare([], {
        
        _id:null,
        _runningOperations: null,
        constructor: function(id) {
            this._id=id;
            this._runningOperations = 0;
            topic.subscribe("md2/contentprovider/startOperation/"+id, lang.hitch(this, function(){
                this._runningOperations+=1;
            }));
            topic.subscribe("md2/contentprovider/finishOperation/"+id, lang.hitch(this, function(){
                this._runningOperations-=1;
            }));
        }
    });
});
