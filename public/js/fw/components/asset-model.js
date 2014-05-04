define(
    [
        'backbone',
        'when',
        'fw/core/com'
    ], function(Backbone, when, com) {

        'use strict';

        var noop = function() {};

        var AssetModel = Backbone.Model.extend({
            // @TODO    create a real `id` attrbute (if dynamic: concat params)
            // idAttribute: 'uniqId', // dummy `id` attribute to allow use duplication of ids

            defaults: {
                timestamp: undefined,  // is setted when the data is loaded,
                path: undefined,     // url of the source
                data: undefined,
                cache: true,
                preload: false
            },

            // allow this object to be extended by a user
            constructor: function() {
                var initialize = this.initialize;
                this.initialize = function() {};
                Backbone.Model.prototype.constructor.apply(this, arguments);
                this.initialize = initialize;

                if (this.get('isDynamic')) {
                    this.mapPath();
                };

                // add a timestamp if cache === false to force new file download
                if (this.get('cache') === false) {
                    this.set('path', this.get('path') + '?t=' + new Date().getTime());
                }

                // create promise for `loaded` synhronisation
                var defer = when.defer();

                this.on('change:data', _.bind(function() {
                    defer.resolve(this);
                }, this));

                this.promise = defer.promise;

                this.initialize();
            },

            initialize: function() {
                // console.log(this.id);
            },

            // create the path according to given params
            mapPath: function() {
                var path = this.get('path');

                _.each(this.get('params'), function(value, key) {
                    path = path.replace(':' + key, value);
                });
                // no need to trigger an event here
                this.set('path', path, { silent: true });
            },

            onload: function(callback, ctx) {
                when(this.promise).done(_.bind(callback, this));
            },

            // aliases
            getData: function() { return this.get('data'); },
            data: function() { return this.get('data'); },

            // clean events
            destroy: function() {
                this.off('change:data');
            }
        });

        return AssetModel;

    }
);
