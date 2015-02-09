define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/topic",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/MainWidget.html",
    "./contentprovider/ContentProviderRegistry",
    "./contentprovider/LocationProviderFactory",
    "./datamapper/DataMapper",
    "./handler/MD2DataEventHandler",
    "./view/WidgetRegistry",
    "./view/ViewManager",
    "./events/EventRegistry",
    "./actions/ActionFactory",
    "./validators/ValidatorFactory",
    "./datatypes/TypeFactory"
], function(
    declare,
    lang,
    array,
    topic,
    _Widget,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    templateStringContent,
    ContentProviderRegistry,
    LocationProviderFactory,
    DataMapper,
    MD2DataEventHandler,
    WidgetRegistry,
    ViewManager,
    EventRegistry,
    ActionFactory,
    ValidatorFactory,
    TypeFactory            
) {
    
    return declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        
        templateString: templateStringContent,
        
        _isFirstExecution: true,
        
        _startedWorkflowInstanceId: null,
        
        _transactionId: null,
                
        constructor: function(injectedServices) {
            declare.safeMixin(this, injectedServices);
        },
        
        startWorkflow: function()  {
            // staring the workflow...
            // first, check if the workflow has already been started
            // in case it has been started, the variable '_startedWorkflowInstanceId'
            // is already set, otherwise it is null...
            if(this._startedWorkflowInstanceId === null) {
                // workflow instance started for first time...
                // generate and save a new workflow instance ID...
                this._startedWorkflowInstanceId = this.generateUUID();
                // simply open this window now...
                this.openWindow();
            } else {
                // this workflow has been started in the past
                
                // only check for a resume workflow instance, if the global active instance id is the one from this workflow...
                var resumeWfE = null;
                if(this._startedWorkflowInstanceId === this._workflowStateHandler.getCurrentActiveWorkflowInstance()) {
                    var resumeWfE = this._workflowStateHandler.getResumeWorkflowElement(this._startedWorkflowInstanceId);
                }
                
                // get the workflow element to which to resume to (if any..)
                // check where to resume the workflow instance state..
                if(resumeWfE === null) {
                    // there is no last workflow element to resume to,
                    // thus simply open the window of this workflow element again...
                    this.openWindow();
                } else {
                    // there is a workflow element to resume to
                    // open the view of that workflow element,
                    // instead of the view of _this_ workflow element
                    // we need the MD2MainWidget instance of the other workflow element...
                    var md2MainWidgetInstanceOfResumeWfE = this._workflowStateHandler.getMD2MainWidget(resumeWfE);
                    this.openWindowWithMD2Instance(md2MainWidgetInstanceOfResumeWfE);
                }
            }
        },
        
        openWindow: function() {
            
            this.openWindowWithMD2Instance(this);
            
            /*
            var window = this._window;
            var actionFactory = this._actionFactory;
            if (window) {
                window.show();
                
                // execute onInitialized action
                if (this._isFirstExecution) {
                    this._isFirstExecution = false;
                    actionFactory.getCustomAction(this._dataFormBean.onInitialized).execute();
                } else {
                    this._viewManager.restoreLastView();
                }
            } */
        },
        
        openWindowWithMD2Instance: function(otherMd2Instance) {
            this._workflowStateHandler.setCurrentActiveWorkflowInstance(this._startedWorkflowInstanceId);
            var window = otherMd2Instance._window;
            var actionFactory = otherMd2Instance._actionFactory;
            if (window) {
                window.show();
                
                // execute onInitialized action
                if (otherMd2Instance._isFirstExecution) {
                    otherMd2Instance._isFirstExecution = false;
                    actionFactory.getCustomAction(otherMd2Instance._dataFormBean.onInitialized).execute();
                } else {
                    otherMd2Instance._viewManager.restoreLastView();
                }
            }
        },
        
        openWindowALT: function() {
            var window = this._window;
            var actionFactory = this._actionFactory;
            if (window) {
                var id = this._dataFormBean.id;
                var lastWindow = this._workflowStateHandler.getLastWindow(id);
                // check if there is a last view specified.
                // if there is one, then open this last view and not
                // the current one of this active workflow element
                if(lastWindow !== null) {
                    // there is a last view specified -> get the md2MainWidget instance
                    // of this workflow element, because it is needed to "openWindow" this view
                    var md2MainWidget = this._workflowStateHandler.getMD2MainWidget(lastWindow);
                    if(md2MainWidget !== null) {
                        var md2Id = md2MainWidget._dataFormBean.id; // id of the last workflow element
                        var md2viewManager = md2MainWidget._viewManager; // the view manager of the last workflow element
                        // create the window which should be opended with the
                        // md2MainWidget instance of the last workflow element
                        window = this._createWindow2(md2MainWidget, md2Id, md2viewManager);
                    }
                }
                
                window.show();
                                
                // execute onInitialized action
                if (this._isFirstExecution) {
                    this._isFirstExecution = false;
                    actionFactory.getCustomAction(this._dataFormBean.onInitialized).execute();
                } else {
                    this._viewManager.restoreLastView();
                }
            }
        },
        
        closeWindow: function() {
            var window = this._window;
            if (window) {
                this._viewManager.destroyCurrentView();
                window.hide();
            }
        },
        
        build: function() {
            // ID of this app
            var appId = this._dataFormBean.appId;
            
            // ID of this workflow element
            var wfeId = this._dataFormBean.id;
            
            // injected notification service
            var notificationService = this._notificationService;
            
            // injected custom actions
            var customActions = this._customActions;
            
            // injected entities and enums
            var modelFactories = this._models;
            
            // injected workflow event handler
            var workflowEventHandler = this._workflowEventHandler;
            
            this._workflowStateHandler.registerMD2MainWidget(wfeId, this);
            
            this._transactionId = this._workflowStateHandler.startNewTransaction();
            
            // Object of references to be passed to actions/contentProviders etc.
            // Will be populated after all components are built. Thus, $ is only
            // available after the build!! It is meant to be used during runtime
            // to easily access all components.
            var $ = {};
            
            var typeFactory = new TypeFactory(modelFactories);
            
            var contentProviderRegistry = new ContentProviderRegistry();
            this._createContentProviders(appId, contentProviderRegistry, typeFactory, $);
            
            var dataMapper = new DataMapper();
            
            var widgetRegistry = new WidgetRegistry();
            var viewManager = this._createDataForms(widgetRegistry, dataMapper, typeFactory, appId);
            this._viewManager = viewManager;
            
            var eventRegistry = new EventRegistry(appId);
            var dataEventHandler = new MD2DataEventHandler(dataMapper, notificationService, this, appId);
            
            var validatorFactory = new ValidatorFactory();
            
            var actionFactory = new ActionFactory(customActions, $);
            this._actionFactory = actionFactory;
            
            this._window = this._createWindow(wfeId, viewManager);
                       
            lang.mixin($, {
                dataMapper: dataMapper,
                eventRegistry: eventRegistry,
                contentProviderRegistry: contentProviderRegistry,
                viewManager: viewManager,
                widgetRegistry: widgetRegistry,
                dataEventHandler: dataEventHandler,
                notificationService: notificationService,
                validatorFactory: validatorFactory,
                actionFactory: actionFactory,
                typeFactory: typeFactory,
                create: typeFactory.create,
                workflowEventHandler: workflowEventHandler
            });
        },
        
        _createContentProviders: function(appId, contentProviderRegistry, typeFactory, $) {
            // custom content providers
            var contentProviderFactories = this._contentProviders;
            array.forEach(contentProviderFactories, function(contentProviderFactory) {
                var contentProvider = contentProviderFactory.create(typeFactory, this._transactionId);
                contentProviderRegistry.registerContentProvider(contentProvider);
            }, this);
            
            // instantiate location content provider
            var locationProviderFactory = new LocationProviderFactory();
            var locationStoreFactory = this._locationFactory;
            var locationProvider = locationProviderFactory.create(appId, locationStoreFactory, typeFactory);
            contentProviderRegistry.registerContentProvider(locationProvider);
        },
        
        _createDataForms: function(widgetRegistry, dataMapper, typeFactory, appId) {
            
            // DataFormService and dataFormBean injected by the component runtime
            var dataFormService = this._dataFormService;
            var views = this._dataFormBean.views;
            
            var viewManager = new ViewManager(widgetRegistry, dataFormService, dataMapper, typeFactory, this, appId);
            
            array.forEach(views, function(view) {
                viewManager.setupView(view.name, view.dataForm);
            });
            
            return viewManager;
        },
        
        _createWindow: function(wfeId, viewManager) {
            
            var windowSize = {
                w: "60%",
                h: "60%"
            };
            
            var windowProperites = {
                content: this,
                title: this._dataFormBean.windowTitle,
                marginBox: windowSize,
                minimizeOnClose: true,
                maximizable: true,
                windowName: wfeId.concat("_window_root")
            };
            
            var window = this._windowManager.createWindow(windowProperites);
            
            // resize data form on window resizing
            topic.subscribe("md2/window/onResize", lang.hitch(this, function() {
                viewManager.resizeView();
            }));
            
            return window;
        },
        
        _createWindow2: function(md2MainWidget, wfeId, viewManager) {
            
            var windowSize = {
                w: "60%",
                h: "60%"
            };
            
            var windowProperites = {
                content: md2MainWidget,
                title: md2MainWidget._dataFormBean.windowTitle,
                marginBox: windowSize,
                minimizeOnClose: true,
                maximizable: true,
                windowName: wfeId.concat("_window_root")
            };
            
            var window = md2MainWidget._windowManager.createWindow(windowProperites);
            
            // resize data form on window resizing
            topic.subscribe("md2/window/onResize", lang.hitch(md2MainWidget, function() {
                viewManager.resizeView();
            }));
            
            return window;
        },
        
        generateUUID: function( ){
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random()*16)%16 | 0;
                d = Math.floor(d/16);
                return (c=='x' ? r : (r&0x3|0x8)).toString(16);
            });
            return uuid;
        }        
    });
});
