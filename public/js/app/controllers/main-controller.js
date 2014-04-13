define([
        'fw/components/abstract-controller',
        'fw/components/region',
        'app/views/home',
        'app/views/content'
    ], function(AbstractController, Region, HomeView, ContentView) {

        'use strict';

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

            // actions are objects with `show` and `update` (maybe `remove`) as possible keys
            // all other keys will be ignored
            // `this` refers to the controller object inside actions (called with `call`)
            actions: {
                // load assets, create model and views, update regions, etc...
                // if update does not exists, do nothing
                home: {
                    show: function(request, prevRequest) {
                        var region = this.layout.getRegion('main');
                        var homeView = new HomeView();

                        var transition = region.createTransition(true);
                        transition.show(homeView);
                    }
                },

                content: {
                    show: function(request, prevRequest) {
                        var region = this.layout.getRegion('main');
                        var contentModel = new Backbone.Model({
                            param: request.params.id,
                            prevParam: undefined
                        });
                        var contentView = new ContentView({ model: contentModel });

                        var transition = region.createTransition(true);
                        transition.show(contentView);
                    },
                    update: function(request, prevRequest) {
                        var contentView = this.layout.getRegion('main').getView();
                        contentView.model.set({
                            'param': request.params.id,
                            'prevParam': prevRequest.params.id
                        });
                    }
                },
            }

        });

        return MainController;
    }
);
