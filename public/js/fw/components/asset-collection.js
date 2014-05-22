define(
    [
        'backbone',
        'when',
        'fw/components/asset-model'
    ], function(Backbone, when, AssetModel) {

        'use strict';

        // @NOTE as the models are stored in `this.models` which is an array
        //       the default sort is god and promise will be ordered nicely
        var AssetCollection = Backbone.Collection.extend({
            model: AssetModel,

            initialize: function() {},

            onload: function(callback, ctx) {
                var promises = _.pluck(this.models, 'promise');

                when.all(promises).done(function() {
                    callback.apply(ctx, arguments[0]);
                });
            }
        });

        return AssetCollection;
    }
);
