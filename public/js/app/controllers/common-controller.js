define([
        'backbone',
        'fw/components/abstract-controller',
        'app/views/header'
    ], function(Backbone, AbstractController, HeaderView) {

        console.log(arguments);
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
                        transition.complete(function() {
                            headerView.model.set('state', request.state.id);
                        });
                    },
                    update: function(request, prevRequest) {
                        var headerView = this.layout.getRegion('header').getView();
                        headerView.model.set('state', request.state.id);
                        headerView.randomizeContent();
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
