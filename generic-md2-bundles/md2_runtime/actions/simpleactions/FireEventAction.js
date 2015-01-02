define([
    "dojo/_base/declare",
    "../_Action"
],
function(declare, _Action) {
    
    return declare([_Action], {
        
        _actionSignature: undefined,
        
        _workflowelement: undefined,
        
        _event: undefined,
        
        constructor: function(workflowelement, event) {
            this._actionSignature = "FireEventAction$$" + workflowelement + event;
            this._workflowelement = workflowelement;
            this._event = event;
        },
        
        execute: function() {
            this.$.workflowEventHandler.handleEvent(this._event, this._workflowelement);	
        }
        
    });
});
