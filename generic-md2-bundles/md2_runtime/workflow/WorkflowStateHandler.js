define([
    "dojo/_base/declare", "ct/Hash"
],
function(declare, Hash) {
    
    return declare([], {

        createInstance: function() {
            return {
              instance: this,
              _resumeWorkflowInstance: new Hash(),
              _md2MainWidgets: new Hash(),
              _currentActiveWorkflowInstanceId: null, // the global active instance id of the currently started workflow...
              getResumeWorkflowElement: this.getResumeWorkflowElement,
              setResumeWorkflowElement: this.setResumeWorkflowElement,
              registerMD2MainWidget: this.registerMD2MainWidget,
              getMD2MainWidget: this.getMD2MainWidget,
              getCurrentActiveWorkflowInstance: this.getCurrentActiveWorkflowInstance,
              setCurrentActiveWorkflowInstance: this.setCurrentActiveWorkflowInstance
            };
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
        }
    });
});
