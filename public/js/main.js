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
        'fw/services/assets-loader',
        'createjs',
        'when'
    ], function(module, config, _, FW, CommonController, AppLayout, Region, BaseView, com, AssetsManager, AssetModel, AssetsLoader, createjs, when) {

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
            // @TODO => put it the controller
            // console.log(config);
            var assetsManager = new AssetsManager(_.identify(config.assets, 'id'), FW.com);
            var assetsLoader = new AssetsLoader(FW);

            // console.log(assetsManager.config);
            var asset = assetsManager.get('img-1');
            console.log(asset.toJSON());

            // next step:
            // var assets = assetsManager.get(['img-1', 'img-2']);
            // then
            // assetsManager.createStack(['img-1', 'img-2']);
            // assetsManager.onload(function() {});

            // instanciate model
            // var model = new AssetModel({ id: 'test', path: '/assets/img-1.jpg' });

            asset.loaded(function(model) {
                var img = new Image();
                img.src = model.get('path');

                var $img = $(img).hide();

                $('body').append($img);
                $img.fadeIn();
            }, this);
            // */

            // start the whole stuff
            Backbone.history.start();
        });
    }
);
