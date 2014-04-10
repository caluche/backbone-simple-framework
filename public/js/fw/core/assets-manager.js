define(
    [
        'backbone'
    ], function(Backbone) {

        'use strict';

        /*
            config.assets = {
                id: {
                    // can define some variables (use backbone routing syntax)
                    path: '/path/to/resource/:id1/:id2',
                    // describe values if variable are present in path in some way (discrete, interval)
                    cache: false, // default true - possible values: ['false', 'lazy', 'true'],
                    preload: true, // default false [true|false]
                    // allow to use a user defined Asset object for a specific asset
                    use: 'path/to/MyAssetCollection'
                }
            };

            // AssetLoader is third party loading libray wrapper used as a service by an
            // AssetsManager [extend Backbone.Collection]. Each item of this collection representing
            // an `asset` can be itself a Collection or a Model (depending on its configuration options)
            // The Asset object must share an API for easier use (mostly a `getData` method)

            // A factory method in AssetsManager must be used in order to instanciate the right
            // Model type or Collection type according to the config object

                // example
                // if cache === 'lazy' or `path` variable is present : use an internal collection, else use a model
                // if collection the API can be more complex, (see Vivien's lazyLoad example)

            var AssetModel = Backbone.Model.extend(assetConfig) {
                defaults: {
                    timestamp: undefined,  // is setted when the data is loaded,
                    source: undefined,     // url of the source
                    data: undefined,
                },

                getData: function() {
                    return this.get('data');
                }
            };

            // use AssetModel internally - must hide the recursivity
            var AssetCollection = Backbone.Collection.extend(assetConfig) {
                //  returns data of the last loaded model
                getData: function() {
                    return this.last().getData();
                },
            };

            var AssetsManager = Backbone.Collection.extend(config.asset) {
                // items in this collection can be an AssetModel or an AssetCollection

                // on each state change, destroy all the models with cache === false
            }

            // @NOTE    the AssetsManager could be able to work as a background
            //          task when the user don't interact the system
            //
            //  @TODO   define how this object should communicate with the AssetLoader
            //          events ? dependency injection ?
        */

        // asset model proto
        var AssetModel = Backbone.Model.extend({
            defaults: {
                path: undefined,
                cache: true,
                preload: false,
                timestamp: undefined, // should b set when asset is loaded
                data: undefined
            },

            getData: function() {
                return this.get('data');
            }
        });

        /**
         *  this must keep all the data in the framework format
         *  if the loader needs a specific data presentation (and it will)
         *  it must do the conversion itself
         *
         *  should create a promise for each asset to be loaded
         *
         */
        var AssetsManager = Backbone.Collection.extend({

            initialize: function(models, options) {
                this.config = options.config; // @TODO remove - automatically done by backbone

                this.promises = {};
            },

            load: function(stateId) {

            },

            // receive the collection of the assets to be loaded
            // for a given state
            loadAssets: function(collection) {

            },

            // return a collection of the assets to be loaded
            defineCollection: function(stateId) {

            },

            onLoad: function() {

            }

        });

        return AssetsManager;

    }
)