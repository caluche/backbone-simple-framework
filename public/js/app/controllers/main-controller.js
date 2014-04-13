define([
        'fw/components/abstract-controller',
        'fw/components/region',
        'app/views/home'
    ], function(AbstractController, Region, HomeView) {

        'use strict';

        console.log(new HomeView());

        // dummy controller for testing
        var MainController = AbstractController.extend({
            // common
            initialize: function() {

            },

            // a default implementation should exists in AbstractController
            // the public API should be `remove` (clean stored object, etc...)
            destroy: function() {
                // com.removeHandlers(this)
                this.remove();
            },

            // define all actions
            actions: {
                // these methods should be called with an apply
                // to set `this` to the controller
                // if update does not exists, do nothing
                home: {
                    show: function(request, prevRequest) {
                        var region = this.layout.getRegion('main');
                        var homeView = new HomeView();

                        var transition = region.createTransition(true);
                        transition.show(homeView);
                        // load assets, create model and views,
                        // update regions, etc...
                        console.log('home Show', this, arguments);
                    }
                },

                content: {
                    show: function(request, prevRequest) {
                        // load assets, create model and views,
                        // update regions, etc...
                        console.log('content Show', this, arguments);
                    },
                    update: function(request, prevRequest) {
                        // load assets, update models
                        console.log('content Update', this, arguments);
                    }
                },
            }

        });

        return MainController;
    }
);
