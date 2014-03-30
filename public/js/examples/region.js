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

            // start the whole stuff
            Backbone.history.start();
        });
    }
);
