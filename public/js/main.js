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
            var assetsManager = new AssetsManager(_.identify(config.assets, 'id'), FW.com);
            var assetsLoader = new AssetsLoader(FW);

            // this is done internally from state definition
            var collection = assetsManager.get(['img-1', 'img-2']);
            console.log(collection);

            // this is done in the controller
            assetsManager.add({ id: 'img-3', path: '/assets/img-3.jpg' });

            assetsManager.onload(function(img1, img2, img3) {

                var img = new Image();
                img.src = img1.get('path');

                var $img = $(img).hide();

                $('body').append($img);
                $img.fadeIn();
            });

            // start the whole stuff
            Backbone.history.start();
        });
    }
);
