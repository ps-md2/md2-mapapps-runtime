define([
    "dojo/_base/declare", "ct/Hash", "./WorkflowStateTransaction"
],
function(declare, Hash, WorkflowStateTransaction) {
    
    return declare([], {
        
        worflowStore:null,
        instance:null,
        _resumeWorkflowInstance:null,
        _md2MainWidgets:null,
        _currentActiveWorkflowInstanceId:null,
        _workflowStateTransactions:null,
        _currentTransactionCounter: null,
        constructor: function(store) {
            this.workflowStore = store;
            this.instance= this;
            this._resumeWorkflowInstance= new Hash();
            this._md2MainWidgets= new Hash();
            this._currentActiveWorkflowInstanceId= null;
            this._workflowStateTransactions = {};
            this._currentTransactionCounter = 0;
        },
        
        getCurrentActiveWorkflowInstance: function() {
            return this._currentActiveWorkflowInstanceId;
        },
        
        setCurrentActiveWorkflowInstance: function(newActiveWorkflowInstanceId) {
            this._currentActiveWorkflowInstanceId = newActiveWorkflowInstanceId;
        },
        
        getResumeWorkflowElement: function(workflowElementId) {
            var resumeWorkflowElement = this._resumeWorkflowInstance.get(workflowElementId);
            if(!resumeWorkflowElement) {
                return null;
            }
            return resumeWorkflowElement;
        },
        
        setResumeWorkflowElement: function(instanceId, workflowElementId) {
            this._resumeWorkflowInstance.set(instanceId, workflowElementId);
        },
        
        registerMD2MainWidget: function(workflowElementId, md2MainWidget) {
            this._md2MainWidgets.set(workflowElementId, md2MainWidget);
        },
        
        getMD2MainWidget: function(workflowElementId) {
            var md2MainWidget = this._md2MainWidgets.get(workflowElementId);
            if(!md2MainWidget) {
                return null;
            }
            return md2MainWidget;
        },
        
        startNewTransaction: function(){
            this._currentTransactionCounter = this._currentTransactionCounter + 1;
            this._workflowStateTransactions[this._currentTransactionCounter] = new WorkflowStateTransaction(this._currentTransactionCounter);
            return this._currentTransactionCounter;
        },
        
        // Save and retrieve workflow instances
        
        changeWorkflowElement: function(previousControllerId, nextControllerId, nextWorflowElement) {
            var previousController = this.instance.controllers.get(previousControllerId);
            var nextController = this.instance.controllers.get(nextControllerId);  
            nextController._startedWorkflowInstanceId = previousController._startedWorkflowInstanceId;
            previousController.closeWindow();
            previousController._isFirstExecution = true;
            this.instance.workflowStateHandler.setResumeWorkflowElement(nextController._startedWorkflowInstanceId, nextWorflowElement);
            nextController.openWindow();
        },
            
        fireEventToBackend: function(event, workflowElement, currentMainWidget, currentControllerId){
            var currentController = this.instance.controllers.get(currentControllerId);
            currentController.closeWindow();
            currentController._isFirstExecution = true;
            var parameters = {
                instanceId: currentController._startedWorkflowInstanceId,
                lastEventFired: event,
                currentWfe: workflowElement,
                currentContentProviders: this.instance.workflowStateHandler.getContentProvidersForMD2MainWidget(currentMainWidget)
            };
            var requestArgs = {
                url: this.url,
                content: parameters,
                handleAs: "json"
            };
            return ct_request(requestArgs,{usePost:true});
        }
    });
});
