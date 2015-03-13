define(["dojo/_base/declare", 
    "dojo/_base/array",
    "ct/_Connect",
    "ct/Stateful",
    "ct/ui/controls/dataview/DataViewModel",
    "ct/ui/controls/dataview/DataView",
    "ct/store/ComplexMemory",
    "dojo/_base/lang"],
        function (declare, array, _Connect, Stateful, DataViewModel, DataView, ComplexMemory, lang) {
            return declare([_Connect], {
                i18n: {
                    grid: {
                        title: "Title",
                        dataView: {
                            DGRID: {
                                loadingMessage: "Fetching incoming workflows from backend, please wait...",
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
                    this.workflow_store = this.workflow_store_factory.create();
                    return this.build_dataView();
                },
                destroyInstance: function (widget) {
                    this.disconnect();
                    clearInterval(this._updateDataInterval);
                    widget.destroyRecursive();
                },
                build_dataView: function(){
                    var model = this._viewModel = new DataViewModel({
                        store: this.workflow_store
                    });

                    var dataView = this._dataView = this._createDataView();
                    //this._gridNode.set("content", dataView);
                    dataView.startup();
                    dataView.setModel(model);
                    this._listeners.connect(dataView, "onItemClicked", this, function (evt) {
                        var that = this;
                        this.workflow_store.get(evt.itemId).then(function(result){
                            var mainWidget = that._workflowStateHandler.getMD2MainWidget("md2_"+result.currentWorkflowElement);
                            that._workflowStateHandler.setLastStartedTool(null);
                            mainWidget.startWorkflow(result.contentProviderIds, result.instanceId);
                        });
                    }); 
                    this._updateDataInterval = window.setInterval(lang.hitch(this, "_updateData"), 1000);
                   
                    return dataView;
                },
                _createDataView: function(){
                    var i18n = this.i18n.grid.dataView;
                    var dataView = new DataView({
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
                                {
                                    "matches": {
                                      "name": "instanceId"
                                    },
                                      "title": "ID",
                                      "width": 50
                                },
                                {
                                    "matches": {
                                      "name": "currentWorkflowElement"
                                    },
                                      "title": "Workflow Element"
                                },
                                {
                                    "matches": {
                                      "name": "lastEventFired"
                                    },
                                      "title": "Last Event Fired"
                                },
                                /*{
                                    "matches": {
                                      "name": "waitingSince"
                                    },
                                      "title": "Waiting Since"
                                }
                                ,{ //Maybe use this for generic column filtering
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
                },
                _updateData: function() {
                    // called periodically to refresh the list's contents
                    this._dataView.updateView();
                }
            });
        });
        