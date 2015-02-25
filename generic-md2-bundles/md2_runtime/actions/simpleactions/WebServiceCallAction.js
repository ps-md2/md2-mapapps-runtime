define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/json",
    "dojo/request/xhr",
    "ct/_lang",
    "ct/request",
    "../_Action"
],
function(declare, lang, json, xhr, ct_lang, ct_request, _Action) {
    
    return declare([_Action], {
        _backendUrl: "http://localhost:8080/CurrentStateProject.backend/service/externalWS/callExternalWS",
        _actionSignature: undefined,
        _url: undefined,
        _method: undefined,
        _queryParams: undefined,
        _bodyParams: undefined,
        
        constructor: function(url, method, queryParams, bodyParams) {
            this._actionSignature = "WebserviceCallAction$$" + url + method + queryParams + bodyParams;
            this._url = url;
            this._method = method;
            this._queryParams = queryParams;
            this._bodyParams = bodyParams;
        },
        
        execute: function() {
            
            var headers = {
                "Content-Type": "application/json"
            };
            
            return xhr.post(ct_request.getProxiedUrl(this._backendUrl, true), {
                data: json.stringify({
                    "url": this._url,
                    "requestMethod": this._method,
                    "queryParams": this._queryParams,
                    "body": this._bodyParams
                }),
                handleAs: "json",
                headers : headers
            });
            
        } 
    });
});
