define([
    "dojo/_base/declare", 
    "dojo/_base/lang",
    "ct/Hash", 
    "./WorkflowStateHandler", 
    "dojo/_base/array", 
    "../contentprovider/ContentProviderRegistry", 
    "../contentprovider/LocationProviderFactory", 
    "../datatypes/TypeFactory"
],
function(declare, lang, Hash, WorkflowStateHandler, array, ContentProviderRegistry, LocationProviderFactory,TypeFactory) {
    
    return declare([], {

        createInstance: function() {
                        
            // injected entities and enums
            var modelFactories = this._models;
            
            var typeFactory = new TypeFactory(modelFactories);
            
            var appId = this._properties.appId;
            
            
            // Object of references to be passed to actions/contentProviders etc.
            // Will be populated after all components are built. Thus, $ is only
            // available after the build!! It is meant to be used during runtime
            // to easily access all components.
            var $ = {};
            
            var typeFactory = new TypeFactory(modelFactories);
            
            var contentProviderRegistry = new ContentProviderRegistry();
            this._createContentProviders(appId, contentProviderRegistry, typeFactory, $);
            
            lang.mixin($, {
                contentProviderRegistry: contentProviderRegistry,
                typeFactory: typeFactory,
                create: typeFactory.create
            });
            
            var store = this.workflow_store_factory.create();
            return new WorkflowStateHandler(store, $);

        },
        _createContentProviders: function(appId, contentProviderRegistry, typeFactory, $) {
            // custom content providers
            var contentProviderFactories = this._contentProviders;
            array.forEach(contentProviderFactories, function(contentProviderFactory) {
                var contentProvider = contentProviderFactory.create(typeFactory, $);
                contentProviderRegistry.registerContentProvider(contentProvider);
            }, this);
            
            // instantiate location content provider
            var locationProviderFactory = new LocationProviderFactory();
            var locationStoreFactory = this._locationFactory;
            var locationProvider = locationProviderFactory.create(appId, locationStoreFactory, typeFactory);
            contentProviderRegistry.registerContentProvider(locationProvider);
        }
    });
});
