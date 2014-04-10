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
        'createjs',
    ], function(module, config, _, FW, CommonController, AppLayout, Region, BaseView, createjs) {

        'use strict';

        var MyView1 = BaseView.extend({
            template: '<h1 id="first-view">My First View</h1>',
        });

        var MyView2 = BaseView.extend({
            template: '<h1 id="second-view">My Second View</h1>',
        });

        var doStuff = function() {
            // prepare
            var region = new Region({
                el: '#test-region'
            });

            var currentView = undefined;

            $('.view1, .view2').on('click', function(e) {
                e.preventDefault();

                var classname = $(this).attr('class');
                var view = (classname == 'view1') ? new MyView1() : new MyView2();

                // is single use
                var transition = region.createTransition();
                transition.hide();

                // mimic loading time
                setTimeout(function() {
                    transition.show(view);
                }, 1000);

                currentView = view;
            });
        }

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
            // call these directly or through config extend
            FW.setLayout(AppLayout);
            // FW.setAppController(MyAppController);
            // FW.registerCommonController(HeaderController)

            // install plugins
            // FW.install('analytics', MyPluginCtor);
            FW.addCommonController('commonController', CommonController);

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
            console.log(createjs);
            var queue = new createjs.LoadQueue(true);

            var assets = [
                { id: 'img-1', src: '/assets/img-1.jpeg'},
                { id: 'img-2', src: '/assets/img-2.jpeg'},
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

            /*
            queue.on('fileprogress', function(e) {
                console.log('fileprogress', e);
            });
            */

            // start the whole stuff
            Backbone.history.start();

            // testing transitions
            doStuff();
        });
    }
);
