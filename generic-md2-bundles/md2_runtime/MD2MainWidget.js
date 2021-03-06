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
        
        _workflowStateHandler: null,
                
        constructor: function(injectedServices) {
            declare.safeMixin(this, injectedServices);
        },
        
        startWorkflowFromTool: function(){
            if (!this._dataFormBean.id === this._workflowStateHandler.getLastStartedTool || !this.isActiveWorkflowInstace()){
                this.$.workflowEventHandler.resetAll();
                this._workflowStateHandler.setCurrentActiveWorkflowInstance(null);
                this._workflowStateHandler.setLastStartedTool(this._dataFormBean.id);
            }
            this.startWorkflow();
        },
        
        startWorkflow: function(contentProviderIds, instanceId)  {
            // start a new transaction
            this.startNewTransaction();
            
            // staring the workflow...
            // first, check if there is a running workflowInstance
            // in case it is, the function value of 'getWorkflowInstanceId'
            // is already set, otherwise it is null...
            if(this.getActiveWorkflowInstanceId() === null && instanceId == null) {
                this.$.workflowEventHandler.resetAll();
                
                // restore contentProviders
                this._workflowStateHandler.resetContentProviders(this._transactionId, contentProviderIds);
                // workflow instance started for first time...
                // generate and save a new workflow instance ID...
                this.generateActiveWorkflowInstanceId();
                

                // simply open this window now...
                this.openWindow();
            } else {
                // a workflow instance has been started in the past     

                // only check for a resume workflow instance, if the global active instance id is the one from this workflow...
                // if instanceId is null, then the local id is used
                var resumeWfE = null;
                if(this.isActiveWorkflowInstace(instanceId)) {
                    var resumeWfE = this._workflowStateHandler.getResumeWorkflowElement(this.getActiveWorkflowInstanceId());
                }else{
                    this.setActiveWorkflowInstanceId(instanceId);
                    this.$.workflowEventHandler.resetAll();

                    // restore contentProviders
                    this._workflowStateHandler.resetContentProviders(this._transactionId, contentProviderIds);
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
        
        startNewTransaction: function(){
             this._transactionId = this._workflowStateHandler.startNewTransaction();
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
            this._workflowStateHandler.setCurrentActiveWorkflowInstance(this.getActiveWorkflowInstanceId());
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
        
        closeWindow: function() {
            var window = this._window;
            if (window) {
                this._viewManager.destroyCurrentView();
                window.hide();
            }
        },
        
        finish: function() {
            this._isFirstExecution = true;
            this.closeWindow();
            if (!this.isActiveWorkflowInstace()){
                this.build();
            }
            this.setActiveWorkflowInstanceId(null);
        },
        
        build: function() {
            // ID of this app
            var appId = this._dataFormBean.appId;
            
            // ID of this workflow element
            var wfeId = this._dataFormBean.id;
            
            // URL of the backend containing the custom webservice proxy
            var webserviceBackendUri = this._dataFormBean.webserviceBackendUri;
            
            // injected notification service
            var notificationService = this._notificationService;
            
            // injected entities and enums
            var modelFactories = this._models;
            
            // injected custom actions
            var customActions = this._customActions;
            
            // injected workflow event handler
            var workflowEventHandler = this._workflowEventHandler;
            
            this._workflowStateHandler.registerMD2MainWidget(wfeId, this);
            
            workflowEventHandler.workflowStateHandler = this._workflowStateHandler;
                  
            // Object of references to be passed to actions/contentProviders etc.
            // Will be populated after all components are built. Thus, $ is only
            // available after the build!! It is meant to be used during runtime
            // to easily access all components.
            var $ = {};
            lang.mixin($, this._workflowStateHandler.$);
            
            var dataMapper = new DataMapper();
            
            var widgetRegistry = new WidgetRegistry();
            var viewManager = this._createDataForms(widgetRegistry, dataMapper, $.typeFactory, appId);
            this._viewManager = viewManager;
            
            var eventRegistry = new EventRegistry(appId);
            var dataEventHandler = new MD2DataEventHandler(dataMapper, notificationService, this, appId);
            
            var validatorFactory = new ValidatorFactory();
            
            var actionFactory = new ActionFactory(customActions, $, webserviceBackendUri);
            this._actionFactory = actionFactory;
            
            this._window = this._createWindow(wfeId, viewManager);
            
            this.$ = $;

            this._workflowStateHandler.registerMD2MainWidget(wfeId, this);
            
            
            var locationFactory = this._locationFactory;
                      
            lang.mixin($, {
                dataMapper: dataMapper,
                eventRegistry: eventRegistry,
                viewManager: viewManager,
                widgetRegistry: widgetRegistry,
                dataEventHandler: dataEventHandler,
                notificationService: notificationService,
                validatorFactory: validatorFactory,
                actionFactory: actionFactory,
                workflowEventHandler: workflowEventHandler,
                locationFactory: locationFactory
            });
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
            
            var  md2MainWidget = this;
            
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
        
        getActiveWorkflowInstanceId: function(){
            if (this._startedWorkflowInstanceId === null){
                this._startedWorkflowInstanceId = this._workflowStateHandler.getCurrentActiveWorkflowInstance();
            }
            return this._startedWorkflowInstanceId;
        },
        
        /**
         * if instanceId is null, the instaneId of the workflowStateHandler is used
         * @param {type} instanceId 
         * @returns {undefined}
         */
        setActiveWorkflowInstanceId: function(instanceId){
            if (instanceId){
                this._startedWorkflowInstanceId = instanceId;
                this._workflowStateHandler.setCurrentActiveWorkflowInstance(instanceId);
            } else {
                this._startedWorkflowInstanceId = this._workflowStateHandler.getCurrentActiveWorkflowInstance(instanceId);
            }
        },
        
        generateActiveWorkflowInstanceId: function(){
            this._startedWorkflowInstanceId = this._workflowStateHandler.generateCurrentActiveWorkflowInstance();
        },
        
        isActiveWorkflowInstace: function(workflowInstance){
            var instanceId = workflowInstance ? workflowInstance : this.getActiveWorkflowInstanceId();
            return instanceId === this._workflowStateHandler.getCurrentActiveWorkflowInstance();
        },
        
        getTransactionId: function(){
            return this._transactionId;
        }
    });
});
