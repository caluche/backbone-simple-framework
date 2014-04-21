define(
    [
        'backbone',
        'when',
        'fw/components/asset-model'
    ], function(Backbone, when, AssetModel) {

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

        // @TODO make sure the model are sorted so the done function
        // is always called at the right order
        // @NOTE while the models are stored in `this.models` which is an array
        //      the default sort should be nice and promise should be ordered just in the
        //      same order model config is defined
        var AssetCollection = Backbone.Collection.extend({
            model: AssetModel,

            initialize: function() {},

            onload: function(callback, ctx) {
                var promises = _.pluck(this.models, 'promise');

                when.all(promises).done(function() {
                    callback.apply(this, arguments[0]);
                });
            }
        });

        /**
         *  this must keep all the data in the framework format
         *  if the loader needs a specific data presentation (and it probably will)
         *  it must do the conversion itself
         *
         *  should create a promise for each asset to be loaded
         */

        /**
         *  2 main configuration:
         *      simple asset - asset path is static and represent only 1 resource
         *      dynamic asset - asset path contains a variable and can represent several resources
         *
         *  these 2 sorts of assets needs a seperate treatement
         */
        var protocolRegex = /(http:\/\/|https:\/\/)/;

        /**
         *  @TODO   handle dynamic assets
         *
         */
        var AssetsManager = function(config, com) {
            this.config = config;
            this.com = com;

            // order assets accrding to their type [dynamic, static]
            _.forEach(this.config, function(config) {
                config.isDynamic = this.isDynamic(config);
            }, this);

            // console.log(this.config);
            this.assets = new AssetCollection();
            // console.log(this.assets);

            // var assetsToPreload = _.where(this.config, { preload: true });
        };

        _.extend(AssetsManager.prototype, {

            initialize: function() {},

            //  this is a host for the current asset collection of the state
            //  it should be created each time a state is created or updated
            currentCollection: undefined,

            //  must define if the required asset is dynamic or not
            //  throw an error if dynamic and no value (or default value)
            //  is actually a Facade
            get: function(ids, params) {
                if (_.isString(ids)) {
                    return this.getOneAsset.apply(this, arguments);
                } else if (_.isArray(ids)) {
                    var assets = _.map(ids, function(id) {
                        // id could be a string or object here
                        return this.getOneAsset.call(this, id);
                    }, this);

                    var assetCollection = new AssetCollection();
                    assetCollection.add(assets);

                    // store a ref to the current collection
                    // this collection is built internally on each request
                    // @NOTE should be done here
                    this.currentCollection = assetCollection;
                    return assetCollection;
                };
            },

            getOneAsset: function(id, params) {
                var asset;

                if (!this.config[id]) {
                    throw new Error('asset "' + id + '" is not defined');
                }
                // find the asset in the stack
                if (this.config[id].isDynamic) {
                    if (!_.isObject(params) && !this.config[id].defaults) {
                        throw new Error('asset "' + id + '" requires parameters');
                    }

                    // find the first asset which match `id` and `params`
                    asset = this.assets.filter(function(model) {
                        return (model.get('id') === id && _.isEqual(model.get('params'), params));
                    })[0];
                } else {
                    asset = this.assets.findWhere({ id: id });
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

            // factory method to create an AssetModel
            // @param modelCtor allow to use user defined AssetModel constructor
            createAsset: function(id, params, modelCtor) {
                var config = _.extend({}, this.config[id]);

                if (params) {
                    config = _.extend(config, { params: params });
                }

                var ctor = modelCtor || AssetModel;
                var asset = new ctor(config);
                this.assets.add(asset);

                // maybe move it back to the asset model
                // it would allow to add an asset directly in any assetCollection
                this.com.publish('load:asset', asset);

                return asset;
            },

            // set parameters of a dynamic asset
            setParams: function(id, params) {

            }

            //  add an asset to the currentCollection
            //  the given asset is also added to the config objects
            //  @NOTE   maybe don't add it to the `config` object
            add: function(config) {
                if (!config.id || !config.path) {
                    throw TypeError('an asset must have an `id` and a `path`');
                }

                this.config[config.id] = config;
                var asset = this.createAsset(config.id, config.params);

                this.currentCollection.add(asset);

                return this.currentCollection;
            },

            // operations on the current collection
            // returns the current collection
            getCurrentCollection: function() {
                return this.currentCollection();
            },
            // alias `getCurrentCollection`
            getCurrentStack: function() {
                return this.getCurrentCollection();
            },

            onload: function(callback, ctx) {
                this.currentCollection.onload(callback, ctx);
            },


            // --------
            // not sure it's usefull...
            getCollection: function(query) {
                return new AssetsCollection.where(query);
            },

            // aliases -> @TODO choose the API
            // once called -> create the queue, and the deferreds ?
            // onload: function(callback) {},
            // loaded: function(callback) {},
            // on: function('load', callback) {},

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
