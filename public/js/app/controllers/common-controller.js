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
                        console.log(request);

                        var headerView = new HeaderView({
                            model: new Backbone.Model({
                                state: request.state.id
                            })
                        });

                        // var region = this.layout.getRegion('header');
                        // var transition = region.createTransition(true);
                        var transition = this.layout.createTransition('header', true);

                        transition.show(headerView);
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
                        // console.log('%c     => footer controller: show', 'color: green');
                    },
                    update: function() {
                        // console.log('%c     => footer controller: update', 'color: green');
                    }
                }
            }

        });

        return CommonController;
    }
);
