define([
        'fw/components/abstract-controller'
    ], function(AbstractController) {

        'use strict';

        // ---------------------------------------------
        // dump controller for testing
        // ---------------------------------------------
        var MyController = AbstractController.extend({
            // common
            initialize: function() {
                // com.subscribe('dispatcher:beforeDispatch', this.doStuff, this);
            },

            // a default implementation should exists in AbstractController
            destroy: function() {
                // com.unsubscribe('dispatcher:beforeDispatch', this.doStuff, this);
            },

            // each `action` method receive `state` and `params` objects as arguments
            home: function(request) {
                // console.timeEnd('start');
                console.log('   =>  controller::home', request);
            },

            index: function(request) {
                // console.timeEnd('start');
                console.log('   =>  controller::index', request);
                // do stuff...

                // unlock app should be done from layout
                // this.resume();
            },

            content: function(request) {
                // console.timeEnd('start');
                console.log('   =>  controller::content', request);
            },

            // clear console before each dispatching
            doStuff: function() {
                console.log('   =>  controller - beforeDispatch');
            }
        });
        // test that `extend` is well transmitted from AbstractController
        var Control2 = MyController.extend({});


        return MyController;
    }
);
