define([
        'fw/components/abstract-controller',
    ], function(AbstractController) {

        'use strict';

        var CommonController = AbstractController.extend({

            actions: {
                header: {
                    show: function() {
                        console.log('%c     => header controller: show', 'color: green');
                    },
                    update: function() {
                        console.log('%c     => header controller: update', 'color: green');
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
