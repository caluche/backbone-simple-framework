define([
        'backbone',
        'fw/components/abstract-controller',
        'app/views/header'
    ], function(Backbone, AbstractController, HeaderView) {

        'use strict';

        var CommonController = AbstractController.extend({

            actions: {
                header: {
                    show: function(request, prevRequest) {
                        var headerView = new HeaderView({
                            model: new Backbone.Model()
                        });

                        var region = this.layout.getRegion('header');
                        var transition = region.createTransition(true);

                        transition.show(headerView);
                        // defer the callback execution to the end of the transition
                        // allow being sure headerView is actually rendered
                        transition.complete(function() {
                            headerView.model.set('state', request.state.id);
                        });
                    },
                    update: function(request, prevRequest) {
                        var headerView = this.layout.getRegion('header').getView();
                        // update through model
                        headerView.model.set('state', request.state.id);
                        // call method directly
                        headerView.randomizeContent();
                        headerView.updateBgColor();
                    }
                },
                footer: {
                    show: function() {
                        console.log('%c     => footer controller: show', 'color: green');
                    },
                    update: function() {
                        console.log('%c     => footer controller: update', 'color: green');
                    }
                }
            }

        });

        return CommonController;
    }
);
