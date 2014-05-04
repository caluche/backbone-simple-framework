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

            beforeAction: function(request, prevRequest) {
                console.log('%c    => before action: ', request.command.controller, request.command.action, request.command.method);
            },

            // actions are objects with `show` and `update` (maybe `remove`) as possible keys
            // all other keys will be ignored
            // `this` refers to the controller object inside actions (called with `call`)
            actions: {
                // load assets, create model and views, update regions, etc...
                // if update does not exists, do nothing
                home: {
                    show: function(request, prevRequest) {
                        var asset = this.assets.get(['img-1', 'img-2', 'reddit']);
                        var region = this.layout.getRegion('main');
                        var transition = region.createTransition(true);

                        asset.onload(function(img1) {
                            var homeView = new HomeView({
                                model: img1
                            });

                            transition.show(homeView);
                        }, this);
                    },
                    close: function() {
                        console.log('home closed');
                    }
                },

                content: {
                    show: function(request, prevRequest) {
                        this.assets.get('with-params', {
                            'with-params': { id: request.params.id }
                        });

                        // var region = this.layout.getRegion('main');
                        // var transition = region.createTransition(true);
                        var transition = this.layout.createTransition('main', true);

                        this.assets.onload(function(withParamsAsset) {
                            var contentModel = new Backbone.Model({
                                param: request.params.id,
                                prevParam: undefined,
                                asset: withParamsAsset.data()
                            });
                            var contentView = new ContentView({ model: contentModel });

                            transition.show(contentView);
                        }, this);
                    },
                    update: function(request, prevRequest) {
                        this.assets.get('with-params', {
                            'with-params': { id: request.params.id }
                        });

                        this.assets.onload(function(withParamsAsset) {
                            var contentView = this.layout.getRegion('main').getView();
                            contentView.model.set({
                                param: request.params.id,
                                prevParam: prevRequest.params.id,
                                asset: withParamsAsset.data()
                            });
                        }, this);
                    },
                    close: function() {
                        console.log('content closed');
                    }
                },
            }

        });

        return MainController;
    }
);
