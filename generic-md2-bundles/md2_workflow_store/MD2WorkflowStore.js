define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "ct/_lang",
    "ct/_when",
    "ct/request",
    "ct/store/StoreUtil",
    "dojo/store/util/QueryResults",
    "dojo/json",
    "dojo/request/xhr", 
    "dojo/store/Memory"
], function(declare, lang, array, ct_lang, ct_when, ct_request, StoreUtil, QueryResults, json, xhr, Memory) {
    
    return declare([Memory], {
        
        /** 
         * Defines the Accept header to use on HTTP requests
         */
        accepts: "application/javascript, application/json",
        
        /**
         * Additional headers to pass in all requests to the server. These can be overridden
         * by passing additional headers to calls to the store.
         */
        headers: {},
        
        /**
         * URL of the web service
         */
        url_workflowState: null,
        url_eventHandler: null,

        /**
         * On every request:
         * Check header of the response on whether it equals the required model version defined in the store.
         */
        checkModelVersion: false,
        
        /**
         * If the model version check is activated, the expected model version of the backend can be defined here
         */
        currentModelVersion: null,
        
        /**
         * The factory of the entity that is managed by this store. It is used to construct new instances of this
         * entity, and populate it with the values received from the backend. Furthermore, it
         * is provided to the content provider (e.g. to reset the content provider).
         */
        entityFactory: undefined,
        
        constructor: function(options) {
            this.idProperty="instanceId";
            declare.safeMixin(this, options);
            
            if (!this.url) {
                throw new Error("[MD2WorkflowStore] Required property 'url' in options is not set!");
            }
            
            if (!this.app) {
                throw new Error("[MD2WorkflowStore] Required property 'app' in options is not set!");
            }
            
            // ensure trailing slash
            this.url = this.url.replace(/\/+$/, "") + "/";
            this.url_workflowState = this.url + "workflowState/";
            this.url_eventHandler = this.url + "eventHandler/";
        },
        
        query: function(query, options) {
            
            var url = this.url_workflowState;
            var parameters = {
                app : this.app
            };
            
            var promise = ct_when(ct_request({
                url: url + "filteredOpenIssues/",
                content: parameters
            }), function(response) {
                var result = response; // (assume response is always an array with >= 0 elements. (Was: lang.isArray(response) ? response : [response];)
                var total = result.length;
                result = StoreUtil.sort(result, options);
                result.total = total;
                return result;
            }, this);
            
            // need delegate, because the promise is frozen in chrome
            promise = lang.delegate(promise, {
                total: promise.then(function(result) {
                    return result.total;
                })
            });
            
            return QueryResults(promise);
        },
        
        get: function(id) {
            
            var url = this.url_workflowState;
            
            var promise = ct_when(ct_request({
                url: url + id
            }), function(result) {
                return result;
            }, this);
            
            return QueryResults(promise);
        },
        
        fireEventToBackend: function(parameters, contentProviderIds){
                        
            if (!parameters.instanceId) {
                throw new Error("[MD2WorkflowStore] Required property 'instanceId' in parameters is not set!");
            }
            
            if (!parameters.lastEventFired) {
                throw new Error("[MD2WorkflowStore] Required property 'lastEventFired' in parameters is not set!");
            }
            
            if (!parameters.currentWfe) {
                throw new Error("[MD2WorkflowStore] Required property 'currentWfe' in parameters is not set!");
            }
            var requestArgs = {
                        url: this.url_eventHandler,
                        content: parameters,
                        handleAs: "json"
                    };
            ct_request(requestArgs,{usePost:true});
        },

        getMetadata : function(){
                        return {
                            displayField : "name",
                            fields : [{
                                "title": "__internalId",
                                "name": "__internalId",
                                "type": "integer",
                                "identifier" : false
                            },{
                                "title": "instanceId",
                                "name": "instanceId",
                                "type": "integer",
                                "identifier" : true
                            },{
                                "title": "currentWorkflowElement",
                                "name": "currentWorkflowElement",
                                "type": "string",
                                "identifier" : false
                            },{
                                "title": "lastEventFired",
                                "name": "lastEventFired",
                                "type": "string",
                                "identifier" : false
                            }]
                        };
                    }
        
    });
});
