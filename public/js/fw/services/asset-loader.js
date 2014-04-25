define(
    [
        'backbone',
        'underscore',
        'createjs'
    ], function(Backbone, underscore, createjs) {

        'use strict';

        var AssetsLoader = function(framework) {
            this.framework = framework;
            this.com = framework.com;
            // initialize createjs
            this.queue = new createjs.LoadQueue();
            this.stack = {};

            // subscriptions
            this.queue.on('fileload', _.bind(this.handleFileLoad, this));
            this.com.on('load:asset', this.loadAsset, this);
            // this.com.on('load:assets', this.loadAssets, this);
        }

        _.extend(AssetsLoader.prototype, Backbone.Events, {

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
                    timestamp: new Date().getTime(),
                });

                // remove from stack
                this.stack[cid] === undefined;
            }

        });

        return AssetsLoader;

    }
);
