define(["dojo/_base/declare", "dojo/_base/array","./OpenIssuesListWidget" , "ct/_Connect", "ct/Stateful"],
        function (declare, array, OpenIssuesListWidget, _Connect, Stateful) {
            return declare([_Connect], {
                createInstance: function () {
                  //  var mapModel = this._mapModel;
                    //get all service nodes from map model
                  //  var serviceNodes = mapModel.getServiceNodes();
                  //  var glassNodes = mapModel.getGlassPaneLayer().children;
                  //  array.forEach(glassNodes, function(node){
                  //      serviceNodes.push(node);
                   // });
                    var widget = new OpenIssuesListWidget({
                 //       nodes: serviceNodes
                    nodes: [
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
                    //connect to event and force reload
                  //  this.connect(widget,"onLayerUpdated", this._updateLayer);
                    return widget;
                },
                destroyInstance: function (widget) {
                    this.disconnect();
                    widget.destroyRecursive();
                }//,
               // _updateLayer : function() {
               //     this._mapModel.fireModelNodeStateChanged({
               //         source: this
               //     });
               // }
            });
        });
        