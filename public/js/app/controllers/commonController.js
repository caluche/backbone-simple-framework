define([
        'fw/components/abstract-controller',
        'fw/views/base-view',
        'text!templates/common/header.tmpl'
    ], function(AbstractController, BaseView, headerTmpl) {

        'use strict';

        var HeaderView = BaseView.extend({
            index: 0,
            template: '<h1>Header Created</h1>',

            update: function() {
                this.index++;
                var txt = 'Header Updated ' + this.index;
                this.$('h1').text(txt);
            }
        });

        var CommonController = AbstractController.extend({

            // REAL PROBLEM HERE - ERRORS ARE NOT THROWN
            actions: {
                header: {
                    show: function(request, prevRequest) {
                        var region = this.layout.getRegion('header');
                        var transition = region.createTransition(true);
                        var headerView = new HeaderView();

                        transition.show(headerView);
                        console.log('%c     => header controller: show', 'color: green');
                    },
                    update: function(request, prevRequest) {
                        var header = this.layout.getRegion('header').getView();

                        header.update();

                        console.log('%c     => header controller: update', 'color: green');
                    }
                },
                footer: {
                    show: function() {

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
