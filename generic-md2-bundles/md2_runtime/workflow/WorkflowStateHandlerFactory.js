define([
    "dojo/_base/declare", "ct/Hash" , "./WorkflowStateHandler"
],
function(declare, Hash, WorkflowStateHandler) {
    
    return declare([], {

        createInstance: function() {
            var store = this.workflow_store_factory.create();
            return new WorkflowStateHandler(store);
        }
    });
});
