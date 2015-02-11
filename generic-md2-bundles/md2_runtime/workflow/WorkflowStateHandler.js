define([
    "dojo/_base/declare", "dojo/_base/array", "ct/Hash", "./WorkflowStateTransaction"
],
function(declare, array, Hash, WorkflowStateTransaction) {
    
    return declare([], {
        
        _workflowStore:null,
        _resumeWorkflowInstance:null,
        _md2MainWidgets:null,
        _currentActiveWorkflowInstanceId:null,
        _workflowStateTransactions:null,
        _currentTransactionCounter: null,
        $:null,

        constructor: function(store, $) {
            this.$ = $;
            this._workflowStore = store;
            this._resumeWorkflowInstance = new Hash();
            this._md2MainWidgets = new Hash();
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
            this._workflowStateTransactions[this._currentTransactionCounter] = new WorkflowStateTransaction(this._currentTransactionCounter, this._workflowStore, this);
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
            
        fireEventToBackend: function(event, workflowElement, currentController, transactionId){
            var transaction = this._getTransaction(transactionId);
            if (transaction){
                transaction.fireEventToBackend(event, workflowElement, currentController);
            }else{
                Error("Transaction could not be retrieved");
            }
        },
        
        _getTransaction: function(transactionId){
            var transaction = this._workflowStateTransactions[transactionId];
            return transaction;
        },
        
        _getContentProviderIds: function(){
            var contentProviders = this.$.contentProviderRegistry.getContentProviders();
            var result = {};
            for (var key in contentProviders){
                result[key] = [];
                var content = contentProviders[key].getContent();
                if (!contentProviders[key]._isManyProvider){
                    if (content.hasInternalID()){
                        result[key].push(content.getInternalID());
                    }
                }else{
                    array.forEach(content, function(entry){
                        if (entry.hasInternalID()){
                            result[key].push(entry.getInternalID());
                        }
                    });
                }
            }
            return result;
        }
    });
});
