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
    "./datatypes/TypeFactory",
    "./workflow/WorkflowStateHandler"
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
    TypeFactory,
    WorkflowStateHandler            
) {
    
    return declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        
        templateString: templateStringContent,
        
        _isFirstExecution: true,
                
        constructor: function(injectedServices) {
            declare.safeMixin(this, injectedServices);
        },
        
        openWindow: function() {
            var window = this._window;
            var actionFactory = this._actionFactory;
            if (window) {
                var xyz = this._workflowStateHandler;
                var id = this._dataFormBean.id;
                var lastWindow = this._workflowEventHandler.getLastWindow(id);
                if(lastWindow !== null) {
                    
                    var md2MainWidget = this._workflowEventHandler.getMD2MainWidget(lastWindow);
                    var kjaslfda = this._workflowStateHandler.getMD2MainWidget(lastWindow);
                    if(md2MainWidget !== null) {
                        var md2Id = md2MainWidget._dataFormBean.id;
                        var md2viewManager = md2MainWidget._viewManager;
                        window = this._createWindow(md2Id, md2viewManager);
                        
                        window = this._foobar(md2MainWidget, md2Id, md2viewManager);
                    }                    
                    
                    //var widgetRegistry = new WidgetRegistry();
                    //var typeFactory = new TypeFactory(this._models);
                    //var dataMapper = new DataMapper();
                    //var viewManager = this._createDataForms(widgetRegistry, dataMapper, typeFactory, lastWindow);
                    //window = this._createWindow(lastWindow, viewManager);
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
            var viewManager = this._createDataForms(widgetRegistry, dataMapper, typeFactory, wfeId);
            this._viewManager = viewManager;
            
            var eventRegistry = new EventRegistry(appId);
            var dataEventHandler = new MD2DataEventHandler(dataMapper, notificationService, this, appId);
            
            var validatorFactory = new ValidatorFactory();
            
            var actionFactory = new ActionFactory(customActions, $);
            this._actionFactory = actionFactory;
            
            this._window = this._createWindow(wfeId, viewManager);
            
            this._workflowStateHandler = new WorkflowStateHandler();
            this._workflowStateHandler.registerMD2MainWidget(wfeId, this);
            
            this._workflowEventHandler.registerMD2MainWidget(wfeId, this);
            
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
                var contentProvider = contentProviderFactory.create(typeFactory, $);
                contentProviderRegistry.registerContentProvider(contentProvider);
            });
            
            // instantiate location content provider
            var locationProviderFactory = new LocationProviderFactory();
            var locationStoreFactory = this._locationFactory;
            var locationProvider = locationProviderFactory.create(appId, locationStoreFactory, typeFactory);
            contentProviderRegistry.registerContentProvider(locationProvider);
        },
        
        _createDataForms: function(widgetRegistry, dataMapper, typeFactory, wfeId) {
            
            // DataFormService and dataFormBean injected by the component runtime
            var dataFormService = this._dataFormService;
            var views = this._dataFormBean.views;
            
            var viewManager = new ViewManager(widgetRegistry, dataFormService, dataMapper, typeFactory, this, wfeId);
            
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
        
        _foobar: function(md2MainWidget, wfeId, viewManager) {
            
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
        }
        
    });
});
