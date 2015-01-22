define(["dojo/_base/declare", 
    "dojo/_base/array",
    "./OpenIssuesListWidget" ,
    "ct/_Connect",
    "ct/Stateful",
    "ct/ui/controls/dataview/DataViewModel",
    "ct/ui/controls/dataview/DataView",
    "ct/store/ComplexMemory"],
        function (declare, array, OpenIssuesListWidget, _Connect, Stateful, DataViewModel, DataView, ComplexMemory) {
            return declare([_Connect], {
                i18n: {
                    grid: {
                        title: "Title",
                        dataView: {
                            DGRID: {
                                noDataMessage: "No incoming workflows found."
                            },
                            pager: {
                                pageSizeLabelText: "${pageStartItemNumber}-${pageEndItemNumber} of ${itemCount}"
                            }
                        }
                    }
                },
                /**
                * @constructs
                */
                constructor: function () {
                    this._listeners = new _Connect();
                },
                createInstance: function () {
                    return this.build_dataView();
                },
                destroyInstance: function (widget) {
                    this.disconnect();
                    widget.destroyRecursive();
                },
                build_dataView: function(){
                    var store = new ComplexMemory({
                        idProperty: "id",
                        data: [
                        new Stateful({
                            id: 1,
                            workflowElement: "MediaCapturing",
                            lastEventFired: "LocationDetectedEvent",
                            waitingSince: "2015-01-14"
                        }),
                        new Stateful({
                            id: 2,
                            workflowElement: "LocationDetection",
                            lastEventFired: "ComplaintSubmitEvent",
                            waitingSince: "2015-01-12"
                        }),
                        new Stateful({
                            id: 3,
                            workflowElement: "MediaCapturing",
                            lastEventFired: "LocationDetectedEvent",
                            waitingSince: "2015-01-13"
                        })
                        ]
                    });
                    store.getMetadata = function(){
                        return {
                            displayField : "name",
                            fields : [{
                                "title": "ID",
                                "name": "id",
                                "type": "string",
                                "identifier" : true
                            },{
                                "title": "workflowElement",
                                "name": "workflowElement",
                                "type": "string",
                                "identifier" : true
                            },{
                                "title": "lastEventFired",
                                "name": "lastEventFired",
                                "type": "string",
                                "identifier" : true
                            },{
                                "title": "waitingSince",
                                "name": "waitingSince",
                                "type": "date",
                                "identifier" : true
                            }]
                        };
                    };
                    var model = this._viewModel = new DataViewModel({
                        store: store
                    });
                    var dataView = this._dataView = this._createDataView();
                    //this._gridNode.set("content", dataView);
                    dataView.startup();
                    dataView.set("model", model);
                    this._listeners.connect(dataView, "onItemClicked", this, function (evt) {
                        //this.editCustomInfo(evt.itemId);
                        alert("You clicked on " +  evt.itemId);
                    });
                    return dataView;
                },
                _createDataView: function(){
                    var i18n = this.i18n.grid.dataView;
                    var dataView = this._dataView = new DataView({
                        i18n: i18n,
                        showFilter: true,
                        filterDuringKeyUp: true,
                        showPager: true,
                        showViewButtons: false,
                        itemsPerPage: 10,
                        DGRID: {
                            noDataMessage: i18n.noDataFound,
                            checkboxSelection: false,
                            columns: [//can filter the columns to be shown
                                /*{
                                    "matches": {
                                      "name": "id"
                                    },
                                      "title": "ID"
                                },*/
                                {
                                    "matches": {
                                      "name": "workflowElement"
                                    },
                                      "title": "Workflow Element"
                                },
                                {
                                    "matches": {
                                      "name": "lastEventFired"
                                    },
                                      "title": "Last Event Fired"
                                },
                                {
                                    "matches": {
                                      "name": "waitingSince"
                                    },
                                      "title": "Waiting Since"
                                }
                                /*,{ //Maybe use this for generic column filtering
                                    matches: {
                                        name: {
                                            $eq: "id"
                                        }
                                    }
                                }*/
                            ]
                        }
                    });
                    return dataView;
                }
               
            });
        });
        