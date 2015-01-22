define([
    "dojo/_base/declare",
    "dojo/dom-construct",
    "dijit/_WidgetBase",
    "dojo/_base/array", 
    "dojo/dom-style"
],
function(declare, domConstruct, _WidgetBase, d_array, domStyle) {
    
    return declare([_WidgetBase], {
        baseClass: "openIssueList",
        
        postCreate: function(){
            this.inherited(arguments);
            this._createList();
        },
        _createList: function(){
                var tableElement = domConstruct.create("table", {}, this.domNode);
                var trHead = domConstruct.create("tr", {}, tableElement);
                    var tdWorkflowElementHead = domConstruct.create("td", {innerHTML: "<b>" + 
                                "Workflow Element"+ "</b>"}, trHead );
                    var tdLastEventFiredHead = domConstruct.create("td", {innerHTML: "<b>" + 
                                "Last Event Fired"+ "</b>"}, trHead );
                    var tdWaitingSinceHead = domConstruct.create("td", {innerHTML: "<b>" + 
                                "Waiting Since"+ "</b>"}, trHead );
                d_array.forEach(this.nodes, function(node){
                    var workflowElement = node.get("workflowElement") || node.get("id");
                    var lastEventFired = node.get("lastEventFired");
                    var waitingSince = node.get("waitingSince");
                    var trElement = domConstruct.create("tr", {}, tableElement);
                    var tdWorkflowElement = domConstruct.create("td", {innerHTML: "<b>" + 
                                workflowElement+ "</b>"}, trElement );
                    var tdLastEventFired = domConstruct.create("td", {innerHTML: "<b>" + 
                                lastEventFired+ "</b>"}, trElement );
                    var tdWaitingSince = domConstruct.create("td", {innerHTML: "<b>" + 
                                waitingSince+ "</b>"}, trElement );
                //    domStyle.set(tdElement, "color", node.get("enabled") ? 
                //       "green": "black");
            }, this);
        }
    });
});
