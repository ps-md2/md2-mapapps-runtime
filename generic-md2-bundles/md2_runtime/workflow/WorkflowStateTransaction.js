define([
    "dojo/_base/declare", "dojo/topic", "dojo/_base/lang", "dojo/_base/array", "dojo/json",
],
function(declare, topic, lang, array, json) {
    
    return declare([], {
        
        _id:null,
        _runningOperations: null,
        _fireEventData: null,
        _workflowStore: null,
        _workflowStateHandler: null,
        constructor: function(id, store, workflowStateHandler) {
            this._id=id;
            this._fireEventData = [];
            this._runningOperations = 0;
            this._workflowStore = store;
            this._workflowStateHandler = workflowStateHandler;
            topic.subscribe("md2/contentProvider/startOperation/"+id, lang.hitch(this, function(){
                this._runningOperations+=1;
            }));
            topic.subscribe("md2/contentProvider/finishOperation/"+id, lang.hitch(this, function(){
                this._runningOperations-=1;
                this._checkAndFireEventToBackend();
            }));
        },
        
        fireEventToBackend: function(event, workflowElement, startedWorkflowInstanceId){
            var fireEventData = {};
            fireEventData["event"] = event;
            fireEventData["workflowElement"] = workflowElement;
            fireEventData["startedWorkflowInstanceId"] = startedWorkflowInstanceId;
            this._fireEventData.push(fireEventData);
            this._checkAndFireEventToBackend();
        },
        
        _checkAndFireEventToBackend: function(){
            if (this._runningOperations===0){
                array.forEach(this._fireEventData, function(fireEventData){
                    var parameters = {
                        instanceId: fireEventData["startedWorkflowInstanceId"],
                        lastEventFired: fireEventData["event"],
                        currentWfe: fireEventData["workflowElement"],
                        contentProviderIds: json.stringify(
                            this._workflowStateHandler._getContentProviderIds()
                        )
                    };
                    
                    this._workflowStore.fireEventToBackend(parameters, this._workflowStateHandler._getContentProviderIds());
                }, this);
                this._fireEventData = [];
            }
        }
    });
});
