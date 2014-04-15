define(
    [
        'backbone',
        'when',
        'fw/core/com'
    ], function(Backbone, when, com) {

        'use strict';

        var AssetModel = Backbone.Model.extend({
            idAttribute: 'uniqId', // dummy `id` attribute to allow use duplication of ids

            defaults: {
                timestamp: undefined,  // is setted when the data is loaded,
                path: undefined,     // url of the source
                data: undefined,
                cache: true,
                preload: false
            },

            initialize: function(config) {
                if (this.get('isDynamic')) { this.mapPath(); };

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
            },

            // create the path according to given params
            mapPath: function() {
                var path = this.get('path');

                _.each(this.params, function(value, key) {
                    path = path.replace(':' + key, value);
                });
                // no need to trigger an event here
                this.set('path', path, { silent: true });
            }
        });

        return AssetModel;

    }
);
