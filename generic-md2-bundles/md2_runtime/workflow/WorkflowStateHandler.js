define([
    "dojo/_base/declare", "dojo/_base/array", "ct/Hash", "./WorkflowStateTransaction", "dojo/json"
],
function(declare, array, Hash, WorkflowStateTransaction, json) {
    
    return declare([], {
        
        _workflowStore:null,
        _resumeWorkflowInstance:null,
        _md2MainWidgets:null,
        _currentActiveWorkflowInstanceId:null,
        _workflowStateTransactions:null,
        _currentTransactionCounter: null,
        _lastStartedTool: null,
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
            if (this._currentActiveWorkflowInstanceId !== newActiveWorkflowInstanceId){
                this.removeWorkflowInstanceId(this._currentActiveWorkflowInstanceId);
                this._currentActiveWorkflowInstanceId = newActiveWorkflowInstanceId;
            }
        },
        generateCurrentActiveWorkflowInstance: function(){
            this._currentActiveWorkflowInstanceId=this._generateUUID();
            return this._currentActiveWorkflowInstanceId;
        },
        
        getResumeWorkflowElement: function(workflowInstanceId) {
            var resumeWorkflowElement = this._resumeWorkflowInstance.get(workflowInstanceId);
            if(!resumeWorkflowElement) {
                return null;
            }
            return resumeWorkflowElement;
        },
        
        setResumeWorkflowElement: function(workflowInstanceId, workflowElementId) {
            this._resumeWorkflowInstance.set(workflowInstanceId, workflowElementId);
        },
        
        removeWorkflowInstanceId: function(workflowInstanceId){
            this._resumeWorkflowInstance.remove(workflowInstanceId);
            if (workflowInstanceId === this._currentActiveWorkflowInstanceId){
               this._currentActiveWorkflowInstanceId = null;
            }
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
            var contentProviders = this.$.contentProviderRegistry.getContentProviders();
            for (var key in contentProviders){
                var contentProvider = contentProviders[key];
                if (contentProvider.isRemote()){
                    contentProvider.setTransactionId(this._currentTransactionCounter);
                }
            }
            
            return this._currentTransactionCounter;
        },
        
        // Save and retrieve workflow instances
        
        changeWorkflowElement: function(previousController, nextController, nextWorflowElement) {
            nextController.setActiveWorkflowInstanceId(previousController.getActiveWorkflowInstanceId());
            previousController.finish();
            this.setResumeWorkflowElement(this.getCurrentActiveWorkflowInstance(), nextWorflowElement);
            nextController.startNewTransaction();
            nextController.openWindow();
        },
            
        fireEventToBackend: function(event, workflowElement, currentController, transactionId){
            var transaction = this._getTransaction(transactionId);
            if (transaction){
                transaction.fireEventToBackend(event, workflowElement, currentController.getActiveWorkflowInstanceId());
            }else{
                Error("Transaction could not be retrieved");
            }
            this.setCurrentActiveWorkflowInstance(null);
            this.setLastStartedTool(null);
        },
        
        resetContentProviders: function(transactionId, queriedIds){
            var contentProviderIds = queriedIds ? json.parse(queriedIds, true) : [];
            var contentProviders = this.$.contentProviderRegistry.getContentProviders();
            for (var key in contentProviders){
                var contentProvider = contentProviders[key];

                var internalIds = contentProviderIds[key];

                if (internalIds){
                    contentProvider.restore(internalIds);
                } else {
                    contentProvider.reset();
                }
                
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
                var entries = [];
                var content = contentProviders[key].getContent();
                if (!contentProviders[key]._isManyProvider){
                    if (content.hasInternalID()){
                        entries.push(content.getInternalID());
                    }
                }else{
                    array.forEach(content, function(entry){
                        if (entry.hasInternalID()){
                            entries.push(entry.getInternalID());
                        }
                    });
                }
                
                if (entries.length > 0){
                    result[key] = entries;
                }
            }
            return result;
        },        
        _generateUUID: function( ){
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random()*16)%16 | 0;
                d = Math.floor(d/16);
                return (c=='x' ? r : (r&0x3|0x8)).toString(16);
            });
            return uuid;
        },
        setLastStartedTool: function(lastStartedTool){
            this._lastStartedTool = lastStartedTool;
        },
        getLastStartedTool: function(){
            return this._lastStartedTool;
        }
    });
});
