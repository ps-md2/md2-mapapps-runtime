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
            topic.subscribe("md2/contentProvider/startOperation/"+id, lang.hitch(this, function(){
                alert("It works!")
                this._runningOperations+=1;
            }));
            topic.subscribe("md2/contentProvider/finishOperation/"+id, lang.hitch(this, function(){
                this._runningOperations-=1;
                 alert("It works even more!")
            }));
        }
    });
});
