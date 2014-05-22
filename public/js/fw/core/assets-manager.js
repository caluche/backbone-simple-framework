define(
    [
        'backbone',
        'when',
        'fw/components/asset-model',
        'fw/components/asset-collection'
    ], function(Backbone, when, AssetModel, AssetCollection) {

        'use strict';

        //  config.assets = {
        //      id: {
        //          // can define some variables (use backbone routing syntax)
        //          path: '/path/to/resource/:id1/:id2',
        //          // describe values if variable are present in path in some way (discrete, interval)
        //          cache: false, // default true - possible values: ['false', 'lazy', 'true'],
        //          preload: true, // default false [true|false]
        //      }
        //  };
        //  @NOTE   the AssetsManager could be able to work as a background
        //          task when the user don't interact the system
        var protocolRegex = /(http:\/\/|https:\/\/)/;

        /**
         *  AssetManager
         *  ----------------------------------------------------
         *
         *  this service offers a simple way to handle assets managment
         *  it hide async loading behavior through a simple api `get` - `onload`
         *  as it is instaciated only if an asset loader is defined in the framework
         *  configuration, it's use is optionnal
         *
         *  @TODO   find a way to manage dynamic assets ids
         *          keep id in currentCollection, create cid for commonCollection ?
         */
        var AssetsManager = function(config, com) {
            this.config = config;
            this.com = com;

            // order assets accrding to their type [dynamic, static]
            _.forEach(this.config, function(config) {
                config.isDynamic = this._isDynamic(config);
            }, this);

            this.assetsCollection = new AssetCollection();
            //  host for the current asset collection
            //  a new instance is created each time `get` is called
            this.currentCollection = undefined;

            // preloading
            // var assetsToPreload = _.where(this.config, { preload: true });
            // var preloadCollection = new AssetCollection(assetsToPreload);
            // preloadCollection.onload(function() {
            //     this.trigger('preload:ready');
            // }, this)
        };

        _.extend(AssetsManager.prototype, {

            initialize: function() {},

            //  facade to get assets, main method of the manager
            //  @return AssetCollection
            //
            //  example use :
            //  - simple asset
            //      this.assetsCollection.get('static');
            //
            //  - multiple assets
            //      this.assetsCollection.get(['static1', 'static2'])
            //
            //  - dynamic assets
            //      this.assetsCollection.get(['dynamic1', 'dynamic1'], {
            //          dynamic1: { id: 'test' },
            //          dynamic2: { id: 'niap' }
            //      });
            get: function(ids, params) {
                if (_.isString(ids)) { ids = [ids]; }
                params = params || {};

                var assets = _.map(ids, function(id) {
                    // id could be a string or object here
                    var assetParams = params[id] ? params[id] : null;
                    return this.getOneAsset.call(this, id, assetParams);
                }, this);

                var assetCollection = new AssetCollection();
                assetCollection.add(assets);

                // store a reference of the current collection
                this.currentCollection = assetCollection;
                return assetCollection;
            },

            // get one asset
            // look in the currently loaded assets if the asset exists
            // if cache === false destroy the asset
            // create the asset if it doesn't exists
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
                    asset = this.assetsCollection.filter(function(model) {
                        return (model.get('id') === id && _.isEqual(model.get('params'), params));
                    })[0];
                } else {
                    asset = this.assetsCollection.findWhere({ id: id });
                }

                // if asset exists but has `cache` set to false
                // remove it from the collection
                if (asset && asset.get('cache') === false) {
                    this.assetsCollection.remove(asset);
                    asset = undefined;
                }

                // if asset does not exists, create the object
                if (!asset) {
                    asset = this.createAsset(id, params);
                }

                return asset;
            },

            //  configure a user defined AssetModel for a specific asset
            useModel: function(id, ctor) {},
            // factory method to create an AssetModel
            // @param ctor allow to use user defined AssetModel constructor
            createAsset: function(id, params, ctor) {

                var config = _.extend({}, this.config[id]);

                if (params) {
                    config = _.extend(config, { params: params });
                }

                var modelCtor = ctor || AssetModel;
                var asset = new modelCtor(config);
                this.assetsCollection.add(asset);

                // maybe move it back to the asset model
                // it would allow to add an asset directly in any assetCollection
                this.com.publish('load:asset', asset);

                return asset;
            },

            //  add an asset to the currentCollection
            //  the given asset is also added to the config objects
            /*
            add: function(config) {
                if (!config.id || !config.path) {
                    throw TypeError('an asset must have an `id` and a `path`');
                }

                this.config[config.id] = config;
                var asset = this.createAsset(config.id, config.params);

                this.currentCollection.add(asset);

                return this.currentCollection;
            },
            */

            // // operations on the current collection
            // // returns the current collection
            // getCurrentCollection: function() {
            //     return this.currentCollection();
            // },
            // // alias `getCurrentCollection`
            // getCurrentStack: function() {
            //     return this.getCurrentCollection();
            // },

            // shortcut to the `onload method` of the current collection
            onload: function(callback, ctx) {
                this.currentCollection.onload(callback, ctx);
            },

            // aliases -> @TODO choose API
            // once called -> create the queue, and the deferreds ?
            // onload: function(callback) {},
            // loaded: function(callback) {},
            // on: function('load', callback) {},

            // finds if the `path` contains a variable declaration
            // just look if ':' is present in the path (remove protocol before testing)
            _isDynamic: function(model) {
                var path = model.path.replace(protocolRegex, '');
                return path.indexOf(':') !== -1;
            }

        })

        return AssetsManager;

    }
)
