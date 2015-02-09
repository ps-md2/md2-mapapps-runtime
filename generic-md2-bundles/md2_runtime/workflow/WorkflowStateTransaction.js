define([
    "dojo/_base/declare", "dojo/topic", "dojo/_base/lang", "dojo/_base/array", "ct/request"
],
function(declare, topic, lang, array, ct_request) {
    
    return declare([], {
        
        _id:null,
        _runningOperations: null,
        _fireEventData: null,
        _workflowStore: null,
        constructor: function(id, store) {
            this._id=id;
            this._fireEventData = [];
            this._runningOperations = 0;
            this._workflowStore = store;
            topic.subscribe("md2/contentProvider/startOperation/"+id, lang.hitch(this, function(){
                this._runningOperations+=1;
            }));
            topic.subscribe("md2/contentProvider/finishOperation/"+id, lang.hitch(this, function(){
                this._runningOperations-=1;
                this._checkAndFireEventToBackend();
            }));
        },
        
        fireEventToBackend: function(event, workflowElement, currentController){
            var fireEventData = {};
            fireEventData["event"] = event;
            fireEventData["workflowElement"] = workflowElement;
            fireEventData["currentController"] = currentController;
            this._fireEventData.push(fireEventData);
            this._checkAndFireEventToBackend();
        },
        
        _checkAndFireEventToBackend: function(){
            if (this._runningOperations===0){
                array.forEach(this._fireEventData, function(fireEventData){
                    var currentController = fireEventData["currentController"];
                    currentController.closeWindow();
                    currentController._isFirstExecution = true;
                    var parameters = {
                        instanceId: currentController._startedWorkflowInstanceId,
                        lastEventFired: fireEventData["event"],
                        currentWfe: fireEventData["workflowElement"]
                    };
                    
                    this._workflowStore.fireEventToBackend(parameters);
                }, this);
                this._fireEventData = [];
            }
        }
    });
});
