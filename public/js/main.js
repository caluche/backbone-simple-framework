define(
    [
        'module',
        'config',
        'underscore',
        'fw/fw',
        'app/controllers/common-controller',
        'app/controllers/main-controller',
        'app/views/layouts/app-layout',

        'fw/components/region',
        'fw/components/abstract-loader',
        'fw/views/base-view',
        'fw/core/assets-manager',
        'fw/components/asset-model',
        'fw/plugins/asset-loader',
        'createjs',
        'when'
    ], function(module, config, _, FW, CommonController, MainController, AppLayout, Region, AbstractLoader, BaseView, AssetsManager, AssetModel, AssetLoader, createjs, when) {

        'use strict';

        //  get env config from requirejs
        var env = module.config();

        // ---------------------------------------------
        // erase console if `env.debug` is set to `false`
        // else "avoid errors in browser that lack a console"
        // cf. https://github.com/h5bp/html5-boilerplate/blob/master/js/plugins.js
        (function() {
            var method;
            var noop = function () {};
            var methods = [
                'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
                'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
                'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
                'timeStamp', 'trace', 'warn'
            ];
            var length = methods.length;
            var console = (window.console = window.console || {});

            while (length--) {
                method = methods[length];

                // Only stub undefined methods.
                if (env.debug) {
                    if (!console[method]) {
                        console[method] = noop;
                    }
                } else {
                    console[method] = noop;
                }
            }
        }());
        // ---------------------------------------------

        var Loader = AbstractLoader.extend({

            template: '<p>loading...</p>',

            initialize: function() {
                this.$container = $('body');
                this.render();
            },

            onRender: function() {
                this.$el.hide();
            },

            onTransitionStart: function() {
                this.$el.prependTo(this.$container);
                console.timeEnd('loader timer');
                this.$el.fadeTo(50, 1);
            },

            onTransitionEnd: function() {
                this.$el.fadeTo(200, 0, function() {
                    this.remove();
                });
            }
        });

        BaseView.configure({
            shared: {
                test: 'test shared'
            }
        })


        // wait for the DOM
        $('document').ready(function() {
            console.time('loader timer');
            // configure framework
            FW.configure({
                layout: AppLayout,          // optionnal
                loader: Loader,             // optionnal
                assetLoader: AssetLoader,   // optionnal
                controllers: {
                    'main-controller': MainController
                },
                commonControllers: {
                    'commonController': CommonController
                }
            });

            // initialize framework
            FW.initialize(config, env);

            // install plugins
            // FW.install('analytics', MyPluginCtor);

            // start the whole stuff
            Backbone.history.start();
        });
    }
);
