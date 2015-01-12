define([
    "dojo/_base/declare", "ct/Hash"
],
function(declare, Hash) {
    var lastWindows = {};
    
    var md2MainWidgets = {};
    
    return declare([], {
        createInstance: function() {  
            return {
              instance: this,
              getLastWindow: this.getLastWindow,
              setLastWindow: this.setLastWindow,
              registerMD2MainWidget: this.registerMD2MainWidget,
              getMD2MainWidget: this.getMD2MainWidget
            };
        },
        
        setLastWindow: function(wfeId, lastWindowId) {
            lastWindows[wfeId] = lastWindowId;
        },
        
        getLastWindow: function(id) {
            var window = lastWindows[id];
            if(!window) {
                return null;
            }
            return window;
        },
        
        registerMD2MainWidget: function(id, md2MainWidget) {
            md2MainWidgets[id] = md2MainWidget;
        },
        
        getMD2MainWidget: function(id) {
            var md2MainWidget = md2MainWidgets[id];
            if(!md2MainWidget) {
                return null;
            }
            return md2MainWidget;
        }
    });
});
