define(
    [
        'backbone',
        'when',
        'fw/core/com'
    ], function(Backbone, when, com) {

        'use strict';

        var AssetModel = Backbone.Model.extend({
            // @TODO    create a real `id` attrbute (if dynamic: concat params)
            idAttribute: 'uniqId', // dummy `id` attribute to allow use duplication of ids

            defaults: {
                timestamp: undefined,  // is setted when the data is loaded,
                path: undefined,     // url of the source
                data: undefined,
                cache: true,
                preload: false
            },

            initialize: function(config) {
                if (this.get('isDynamic')) {
                    this.mapPath();
                };

                this.promise = when.promise(_.bind(this.handlePromise, this));
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

                _.each(this.get('params'), function(value, key) {
                    path = path.replace(':' + key, value);
                });
                // no need to trigger an event here
                this.set('path', path, { silent: true });
            }
        });

        return AssetModel;

    }
);
