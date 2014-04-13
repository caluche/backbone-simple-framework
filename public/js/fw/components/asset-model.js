define(
    [
        'backbone',
        'when'
    ], function(Backbone, when) {

        'use strict';

        var AssetModel = Backbone.Model.extend({
            defaults: {
                timestamp: undefined,  // is setted when the data is loaded,
                path: undefined,     // url of the source
                data: undefined,
                cache: true,
                preload: false
            },

            initialize: function(config) {
                this.path = config.path;
                this.id = 'test';
                this.queue = [];

                this.promise = when.promise(_.bind(this.handlePromise, this));
                // should be done by the asset manager
                com.publish('load:asset', this);
            },

            getData: function() {
                return this.get('data');
            },

            handlePromise: function(resolve, reject) {
                this.on('change:data', function() {
                    resolve(this);
                }, this);
            },

            loaded: function(callback, ctx) {
                when(this.promise).done(_.bind(callback, this));
            },

            // clean events
            destroy: function() {
                this.off('change:data');
            }
        });

        return AssetModel;

    }
);
