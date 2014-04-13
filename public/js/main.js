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
        'createjs',
        'when'
    ], function(module, config, _, FW, CommonController, AppLayout, Region, BaseView, com, createjs, when) {

        'use strict';



        // take the [show, update] of each action
        // if this is ketp, a cache system really must be implemented
        // operations must be done on an instance and transfered to the prototype
        // or maybe it makes no sens, just apply the instance to the method
        /*
        var mutateController = function(ctor) {
            var actions = ctor.actions;
            console.log(ctor.actions);
            console.log(new ctor);
            // ctor.action === undefined;
            for (var action in actions) {
                for (var method in actions[action]) {
                    var finalMethodName = '_' + action + _.capitalize(method);
                    console.log(finalMethodName);
                    ctor[finalMethodName] = function() {
                        return this.actions.action.method.apply(this, arguments);
                    }
                    console.log(ctor);
                }
            }

            console.log(ctor);
            return;
        }
        */
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
            var assetsManager = new AssetsManager(config)


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

            // start the whole stuff
            Backbone.history.start();
        });
    }
);
