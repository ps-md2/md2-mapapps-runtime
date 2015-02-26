define([
    "dojo/_base/declare",
    "dojo/dom-construct",
    "ct/_url",
    "dataform/controls/_Control",
    "dijit/_WidgetBase"
],
function (declare, d_domconstruct, ct_url, _Control, _WidgetBase) {
    
    var UploadImageOutput = declare([_WidgetBase], {
        baseClass: "ctImage",
        _setSrcAttr: {node: "imageNode"},
        
        buildRendering: function () {
            // calculate height and width relative to container div
            var w = this.imgW;
            var h = this.imgH;
            if (!w && !h) {
                w = 100;
            }
            var dimStyle = (h ? "height:" + h + "%;" : "") + (w ? "width:" + w + "%;" : "");
            
            // get image src
            //var src = ct_url.resourceURL("http://localhost:9090/proxy?http://localhost:8080/?"+this.value);
            //src: src, 
            this.imageNode = d_domconstruct.create("img", {style: dimStyle});
            var outer = d_domconstruct.create("div", {style: "width:100%;"});
            d_domconstruct.place(this.imageNode, outer);
            this.domNode = outer;
        }
        
    });
    
    var UploadImageOutputControl = declare([_Control], {
        
        controlClass: "uploadimageoutput",
        
        createWidget: function(params) {
            return new UploadImageOutput(params);
        },
        clearBinding: function() {
            this.field && this._updateValue(this.field);
        },
        refreshBinding: function() {
            var binding = this.dataBinding;
            var field = this.field;
            if (!field) {
                // maybe it is only used as "static" image
                return;
            }
            this.connectP("binding", binding, field, "_updateValue");
            this._updateValue(field, undefined, binding.get(field));
        },
        _updateValue: function(prop, oldVal, newVal) {
            var widget = this.widget;
            if (!newVal) {
                widget.set("src", "");
                return;
            }
            if (typeof (newVal) === "object") {
                widget.set(newVal);
                return;
            }
            var src = ct_url.resourceURL("http://localhost:9090/proxy?http://localhost:8080/?"+newVal);
            widget.set("src", src);
        }
    });
    
    return declare([], /** @lends dataform.controls.FormControlFactory.prototype */{
        
        createFormControl: function(widgetParams) {
            return new UploadImageOutputControl(widgetParams);
        }
        
    });
});