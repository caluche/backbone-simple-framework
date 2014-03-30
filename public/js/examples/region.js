define(
    [
        'module',
        'config',
        'fw/fw',
        'fw/components/region'
        'fw/views/base-view'
    ], function(module, config, FW, Region, BaseView) {

        'use strict';

        var MyView1 = BaseView.extend({
            template: '<h1>My First View</h1>'
        });

        var MyView2 = BaseView.extend({
            template: '<h1>My Second View</h1>'
        });

        var MyRegion = Region.extend({
            testTransition: function(prevView, nextView) {
                if (!prevView) {
                    nextView.$el.fadeIn(300);
                    return;
                }

                prevView.fadeTo(300, 0, function() {
                    prevView.close();

                    nextView.fadeIn
                });
            }
        });



        //  get env config from requirejs
        var env = module.config();
        // ---------------------------------------------
        // wait for the DOM
        $('document').ready(function() {
            // intialize the framework
            FW.initialize(config, env);
            // call these directly or through config extend
            // FW.setLayout(MyAppLayout);
            // FW.setAppController(MyAppController);

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

            // start the whole stuff
            Backbone.history.start();

            var noop = function(e) { console.log('bypassed'); e.stopPropagation(); e.preventDefault(); }

            $('ul').on('click hover focus', noop);

            $('li').on('click', function() {
                console.log('clicked');
            });
        });
    }
);
