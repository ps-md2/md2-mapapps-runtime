define([
    "dojo/_base/declare", "dojo/_base/lang", "ct/Hash"
],

function(declare, lang, Hash) {
    return declare([], {
                
        _resumeViewMapping: null,
        
        _workflowStateHandler: null,
        
        _singleton : null,
                
        constructor: function() {
            this._resumeViewMapping = new Hash();
            
            this._singleton = (function () {
                var theMappings = new Hash();

                function createInstance() {
                    var object = new Object("I am the instance");
                    return object;
                }

                return {
                    registerMD2MainWidget: function(id, md2MainWidget) {
                        theMappings.set(id, md2MainWidget);
                    },

                    getMD2MainWidget: function(id) {
                        return theMappings.get(id);
                    },

                    getInstance: function () {
                        if (!instance) {
                            instance = createInstance();
                        }
                        return instance;
                    }
                };
            })();
            
            //this._workflowStateHandler = new WorkflowStateHandlerSingleton();
        },
        
        registerMD2MainWidget: function(id, md2MainWidget) {
           this._resumeViewMapping.set(id, md2MainWidget);
           this._singleton.registerMD2MainWidget(id, md2MainWidget);
           //this._workflowStateHandler.registerMD2MainWidget(id, md2MainWidget);
        },
        
        getMD2MainWidget: function(id) {
           var x = this._singleton.getMD2MainWidget(id);
           return this._resumeViewMapping.get(id); 
        },
        
        map: function(widget, contentProvider, attribute) {
            
            var key = contentProvider.getName() + "$" + attribute;
            var id = widget.getId();
            
            // ContentProvider to FormControl mapping
            var toWidgetMapping = this._contentProviderToWidgetMapping;
            if(!toWidgetMapping.contains(id)) {
                toWidgetMapping.set(id, new Hash());
            }
            var contentProviderTargets = toWidgetMapping.get(id);
            contentProviderTargets.set(key, {
                contentProvider: contentProvider,
                attribute: attribute
            });
            
            // FormControl to ContentProvider mapping
            var toContentProviderMapping = this._widgetToContentProviderMapping;
            if(!toContentProviderMapping.contains(key)) {
                toContentProviderMapping.set(key, new Hash());
            }
            var widgets = toContentProviderMapping.get(key);
            widgets.set(id, widget);
            
            // Set current content provider value in form field (called on formControl)
            if (widget.getWidget()) {
                widget.getWidget().refreshBinding();
            } else {
                widget.setValue(contentProvider.getValue(attribute));
            }
            
            contentProvider.registerObservedOnChange(attribute);
        },
        
        unmap: function(widget, contentProvider, attribute) {
            
            var key = contentProvider.getName() + "$" + attribute;
            var id = widget.getId();
            
            // ContentProvider to FormControl mapping
            var toWidgetMapping = this._contentProviderToWidgetMapping;
            if(toWidgetMapping.contains(id)) {
                toWidgetMapping.get(id).remove(key);
            }
            
            // FormControl to ContentProvider mapping
            var toContentProviderMapping = this._widgetToContentProviderMapping;
            if(toContentProviderMapping.contains(key)) {
                toContentProviderMapping.get(key).remove(id);
            }
            
            contentProvider.unregisterObservedOnChange(attribute);
        },
        
        getContentProviders: function(widgetOrFieldName) {
            var toWidgetMapping = this._contentProviderToWidgetMapping;
            
            var fieldName = lang.isString(widgetOrFieldName)
                          ? widgetOrFieldName
                          : widgetOrFieldName.getId();
            
            if(toWidgetMapping.contains(fieldName)) {
                return toWidgetMapping.get(fieldName);
            } else {
                return new Hash();
            }
        },
        
        getWidgets: function(contentProviderOrName, attribute) {
            var toContentProviderMapping = this._widgetToContentProviderMapping;
            var contentProviderName = lang.isString(contentProviderOrName)
                                    ? contentProviderOrName
                                    : contentProviderOrName.getName();
            var key = contentProviderName + "$" + attribute;
            
            if(toContentProviderMapping.contains(key)) {
                return toContentProviderMapping.get(key);
            } else {
                return new Hash();
            }
        }
        
    });
});

/**

function WorkflowStateHandlerSingleton() {

  var resumeViewMapping = new Hash();
  
  if ( arguments.callee._singletonInstance )
    return arguments.callee._singletonInstance;
  arguments.callee._singletonInstance = this;

  this.registerMD2MainWidget = function(id, md2MainWidget) {
      resumeViewMapping.set(id, md2MainWidget);
  };
  
  this.getMD2MainWidget = function(id) {
      return resumeViewMapping.get(id);
  };
},


 */