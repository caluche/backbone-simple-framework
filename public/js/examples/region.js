define(
    [
        'module',
        'config',
        'fw/fw',
        'fw/components/region',
        'fw/views/base-view'
    ], function(module, config, FW, Region, BaseView) {

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
                }, 400);

                currentView = view;
            })
        }

        //  get env config from requirejs
        var env = module.config();
        // ---------------------------------------------
        // wait for the DOM
        $('document').ready(function() {
            // intialize the framework
            FW.initialize(config, env);

            // start the whole stuff
            Backbone.history.start();

            doStuff();
        });
    }
);
