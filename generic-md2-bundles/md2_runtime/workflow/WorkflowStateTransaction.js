define([
    "dojo/_base/declare", "dojo/topic", "dojo/_base/lang"
],
function(declare, topic, lang) {
    
    return declare([], {
        
        _id:null,
        _runningOperations: null,
        _fireEventData: null,
        constructor: function(id) {
            this._id=id;
            this._fireEventData = {};
            this._runningOperations = 0;
            topic.subscribe("md2/contentProvider/startOperation/"+id, lang.hitch(this, function(){
                alert("It works!")
                this._runningOperations+=1;
            }));
            topic.subscribe("md2/contentProvider/finishOperation/"+id, lang.hitch(this, function(){
                this._runningOperations-=1;
                this._checkAndFireEventToBackend();
                alert("It works even more!")
            }));
        },
        
        fireEventToBackend: function(event, workflowElement, currentController){
            this._fireEventData["event"] = event;
            this._fireEventData["workflowElement"] = workflowElement;
            this._fireEventData["currentController"] = currentController;
            this._checkAndFireEventToBackend();
        },
        
        _checkAndFireEventToBackend: function(){
            if (this._runningOperations===0){
                var currentController = this._fireEventData["currentController"];
                currentController.closeWindow();
                currentController._isFirstExecution = true;
                var parameters = {
                    instanceId: currentController._startedWorkflowInstanceId,
                    lastEventFired: this._fireEventData["event"],
                    currentWfe: this._fireEventData["workflowElement"]
                };
                var requestArgs = {
                    url: this.url,
                    content: parameters,
                    handleAs: "json"
                };
                ct_request(requestArgs,{usePost:true});
            }
        }
    });
});
