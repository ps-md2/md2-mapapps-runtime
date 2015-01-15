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
            d_array.forEach(this.nodes, function(node){
                var title = node.get("title") || node.get("id");
                var trElement = domConstruct.create("tr", {}, tableElement);
                var tdElement = domConstruct.create("td", {innerHTML: "<b>" + 
                            title+ "</b>"}, trElement );
                domStyle.set(tdElement, "color", node.get("enabled") ? 
                    "green": "black");
        }, this);
    }
    });
});
