define(
    [
        'module',
        'config',
        'underscore',
        'fw/fw',
        'app/controllers/common-controller',
        'app/views/layouts/app-layout',

        'fw/components/region',
        'fw/views/base-view',
        'fw/core/com',
        'fw/core/assets-manager',
        'fw/components/asset-model',
        'createjs',
        'when'
    ], function(module, config, _, FW, CommonController, AppLayout, Region, BaseView, com, AssetsManager, AssetModel, createjs, when) {

        'use strict';

        //  get env config from requirejs
        var env = module.config();
        // ---------------------------------------------
        // wait for the DOM
        $('document').ready(function() {
            // intialize the framework
            FW.initialize(config, env);

            FW.setLayout(AppLayout);
            FW.setAssetsLoader();

            FW.addCommonController('commonController', CommonController);
            // install plugins
            // FW.install('analytics', MyPluginCtor);


            /**
             *  // example:
             *  var TestPlugin = function(options) {
             *      this.name = 'plugin-test';
             *
             *      options._com.subscribe('router:change', function() {
             *          console.log('   ->  from plugin', arguments, this)
             *      }, this);
             *  }
             *
             *  // install
             *  FW.install('test-plugin', TestPlugin);
             */

            // PreloadJS testing
            /*
            console.log(createjs);
            var queue = new createjs.LoadQueue(true);

            var assets = [
                { id: 'img-1', src: '/assets/img-1.jpg'},
                { id: 'img-2', src: '/assets/img-2.jpg'},
                { id: 'reddit', src: '/assets/reddit.json'}
            ];

            queue.loadManifest(assets);

            queue.on('complete', function(e) {
                console.log('%ccomplete', 'color: green');
                console.log(e);
            });

            queue.on('progress', function(e) {
                console.log('%cprogress', 'color: grey');
                console.log(e);
            });

            queue.on('error', function(e) {
                console.log('%cerror', 'color: red');
                console.log(e);
            });

            queue.on('fileload', function(e) {
                console.log('%cfileload', 'color: blue');
                console.log(e);
            });

            var AssetManager = Backbone.Collection.extend({
                initialize: function(models, options) {
                    this.model = options.model;
                },

                load: function() {

                },

            });
            */

            /*
                // assets use
                show: function(request, prevRequest) {
                    var region = this.layout.getRegion('main');
                    var transition = region.createTransition();
                    var asset = this.assets.get('img-1');

                    transition.hide();

                    asset.loaded(function(assets) {
                        var myView = new BaseView({
                            model: new Backbone.Model({ path: asset.path });
                        });

                        transition.show(myView);
                    });
                }

            */
            // console.log(config);
            var assetsManager = new AssetsManager({
                config: _.identify(config.assets, 'id'),
            });

            // console.log(assetsManager.config);
            var asset = assetsManager.get('with-params', { id: 23 });
            console.log(asset.toJSON());
            // console.log(assetsManager.assets.toJSON());
            // assetsManager.get('with-params', { id: 54 });
            // console.log(assetsManager.assets.toJSON());
            // assetsManager.get('with-params', { id: 23 });
            // console.log(assetsManager.assets.toJSON());

            /*
            var queue = new createjs.LoadQueue(true);
            // mimic loader service
            com.subscribe('load:asset', function(asset) {
                var manifest = { id: asset.id + ' - ' + asset.cid, src: asset.get('path') };
                queue.loadManifest(manifest);

                queue.on('fileload', function(event) {
                    console.log('%cfileload', 'color: blue');

                    asset.set({
                        type: event.type,
                        data: event.result,
                        timestamp: new Date().getTime()
                    });

                    console.log(asset.toJSON());
                });
            });

            // instanciate model
            var model = new AssetModel({ path: '/assets/img-1.jpg' });

            model.loaded(function(model) {
                var img = new Image();
                img.src = model.get('path');

                $('body').append(img);
            }, this);
            */

            // start the whole stuff
            Backbone.history.start();
        });
    }
);
