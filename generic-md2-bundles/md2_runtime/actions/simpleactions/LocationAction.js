define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "../_Action"
],
function(declare, lang, _Action) {
    
    return declare([_Action], {
        
        _actionSignature: undefined,
       
        _cityInputWidget: undefined, 
        _streetInputWidget: undefined, 
        _streetNumberInputWidget: undefined,
        _postalInputWidget: undefined, 
        _countryInputWidget: undefined, 
        _latitudeOutput: undefined,
        _longitudeOutput: undefined,
        _cityProvider: undefined, 
        _streetProvider: undefined, 
        _stretNumberProvider: undefined, 
        _postalProvider: undefined, 
        _countryProvider: undefined, 
        _latitudeProvider: undefined,
        _longitudeProvider: undefined,
        
        constructor: function(cityInput, cityProvider, streetInput, streetProvider,
                              streetNumberInput, streetNumberProvider, postalInput, postalProvider,
                              countryInput, countryProvider, latitudeOutput,
                              longitudeOutput, latitudeProvider, longitudeProvider) {
            this._actionSignature = "LocationAction$$" + 
                              cityInput + cityProvider + streetInput + streetProvider + 
                              streetNumberInput + streetNumberProvider + postalInput + postalProvider + 
                              countryInput + countryProvider + latitudeOutput + 
                              longitudeOutput + latitudeProvider + longitudeProvider;
            
            this._cityInput = cityInput; 
            this._cityProvider = cityProvider; 
            this._streetInput = streetInput;
            this._streetProvider = streetProvider;
            this._streetNumberInput = streetNumberInput;
            this._streetNumberProvider = streetNumberProvider;
            this._postalInput = postalInput;
            this._postalProvider = postalProvider;
            this._countryInput = countryInput;
            this._countryProvider = countryProvider;
            this._latitudeOutput = latitudeOutput;
            this._longitudeOutput = longitudeOutput;
            this._latitudeProvider = latitudeProvider;
            this._longitudeProvider = longitudeProvider;
        },
        
        execute: function() {
            // get input values...
            var city = this.$.contentProviderRegistry.getContentProvider(this._cityProvider).getValue(this._cityInput);
            var street = this.$.contentProviderRegistry.getContentProvider(this._streetProvider).getValue(this._streetInput);
            var streetNumber = this.$.contentProviderRegistry.getContentProvider(this._streetNumberProvider).getValue(this._streetNumberInput);
            var postal = this.$.contentProviderRegistry.getContentProvider(this._postalProvider).getValue(this._postalInput);
            var country = this.$.contentProviderRegistry.getContentProvider(this._countryProvider).getValue(this._countryInput);
            
            var addressString = street + " " + streetNumber + " " + city + " " + postal + " " + country;
            
            var locationStore = this.$.contentProviderRegistry.getContentProvider("location")._store;
            
            var addressPromise = locationStore._getLocationForAddress(addressString);
            
            addressPromise.then(lang.hitch(this, function(addressCandidate) {
                        if(addressCandidate.length > 0) {
                            var latitude = addressCandidate[0].location.x;
                            var longitude = addressCandidate[0].location.y;
                            
                            var latitudeValue = this.$.create("float",latitude);
                            var longitudeValue = this.$.create("float",longitude);
                            
                            this.$.contentProviderRegistry.getContentProvider(this._latitudeProvider).setValue(this._latitudeOutput, latitudeValue);
                            this.$.contentProviderRegistry.getContentProvider(this._longitudeProvider).setValue(this._longitudeOutput, longitudeValue);
                        }
                    }));
        }
        
    });
});
