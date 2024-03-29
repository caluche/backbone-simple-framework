define(
    [
        'backbone',
        'underscore',
        'createjs'
    ], function(Backbone, underscore, createjs) {

        'use strict';

        // constructor should be a part of AbstractPlugin
        var AssetsLoader = function(framework) {
            this.framework = framework;
            this.com = framework.com;

            this.initialize();
        }

        _.extend(AssetsLoader.prototype, Backbone.Events, {

            initialize: function() {
                // initialize createjs
                this.queue = new createjs.LoadQueue();
                this.stack = {};

                // subscriptions
                this.queue.on('fileload', _.bind(this.handleFileLoad, this));
                this.com.on('load:asset', this.loadAsset, this);
                // this.com.on('load:assets', this.loadAssets, this);
            },

            loadAsset: function(model) {
                this.stack[model.cid] = model;
                var manifest = this.createManifest(model);

                this.queue.loadManifest(manifest);
            },

            // loadAssets: function(collection) {},

            createManifest: function(model) {
                var manifest = {
                    id: model.cid,
                    src: model.get('path')
                };

                return manifest;
            },

            handleFileLoad: function(event) {
                var cid = event.item.id;
                var model = this.stack[cid];

                if (typeof model === 'undefined') {
                    return;
                }

                model.set({
                    type: event.type,
                    data: event.result,
                    timestamp: _.now(),
                });

                // remove from stack
                this.stack[cid] === undefined;
            }

        });

        return AssetsLoader;

    }
);
