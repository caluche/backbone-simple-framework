define(
    [
        'backbone',
        'fw/components/asset-model'
    ], function(Backbone, AssetModel) {

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
        var AbstractAsset = Backbone.Model.extend({

        });

        var AssetsCollection = Backbone.Collection.extend({
            model: AssetModel
        });

        /**
         *  this must keep all the data in the framework format
         *  if the loader needs a specific data presentation (and it will)
         *  it must do the conversion itself
         *
         *  should create a promise for each asset to be loaded
         *
         */

        /**
         *  2 main configuration:
         *      simple asset - asset path is static and represent only 1 resource
         *      dynamic asset - asset path contains a variable and can represent several resources
         *
         *  these 2 sorts of assets needs a seperate treatement
         */
        var protocolRegex = /(http:\/\/|https:\/\/)/;

        var AssetsManager = function(options) {
            this.config = options.config;

            // order assets accrding to their type [dynamic, static]
            _.forEach(this.config, function(config) {
                config.isDynamic = this.isDynamic(config);
            }, this);

            // console.log(this.config);

            // console.log(this.config);
            this.assets = new AssetsCollection();
            // console.log(this.assets);

            var assetsToPreload = _.where(this.config, { preload: true });
            console.log(assetsToPreload);
            // toPreload[0].set('data', 'test');
            //console.log(this.assets.get('img-1'));
            // this.dynamicAssets = model ? collection ?
        };

        _.extend(AssetsManager.prototype, {

            initialize: function() {},

            //  must define if the required asset is dynamic or not
            //  throw an error if dynamic and no value (or default value)
            get: function(id, params) {
                var asset;

                // find the asset in the stack
                if (this.config[id].isDynamic) {
                    if (!_.isObject(params)) {
                        throw new Error('asset "' + id + '" requires parameters');
                    }

                    // find the first asset which match `id` and `params`
                    asset = this.assets.filter(function(model) {
                        return (model.get('id') === id && _.isEqual(model.get('params'), params));
                    })[0];
                } else {
                    asset = this.asset.findWhere({ id: id });
                }

                // if asset exists but has `cache` set to false
                // remove it from the collection
                if (asset && asset.get('cache') === false) {
                    this.assets.remove(asset);
                    asset = undefined;
                }

                // if asset does not exists, create the object
                if (!asset) {
                    asset = this.createAsset(id, params);
                }

                return asset;
            },

            createAsset: function(id, params) {
                var config = _.extend({}, this.config[id]);

                if (params) {
                    config = _.extend(config, { params: params });
                }

                var asset = new AssetModel(config);
                this.assets.add(asset);

                return asset;
            },

            //  add an asset to the config objects
            //  returns an AssetModel instance
            add: function(config) {

            },

            getCollection: function(query) {
                return new AssetsCollection.where(query);
            },

            // once called -> create the queue, and the deferreds ?
            load: function() {

            },

            //
            loaded: function() {

            },

            // finds if the `path` contains a variable declaration
            // just look if ':' is present in the path (remove protocol before testing)
            isDynamic: function(model) {
                var path = model.path.replace(protocolRegex, '');
                return path.indexOf(':') !== -1;
            }

        })

        return AssetsManager;

    }
)
