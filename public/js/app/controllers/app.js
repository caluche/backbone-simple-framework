define([
        'backbone'
    ], function(Backone) {

        'use strict';

        var AbstractController = function(options) {
            var options = options || {};
            // set layout
            this.layout = options.layout;
            this.services = options.services;

            this.initialize(options);
        };

        // copy AbstarctController for testing for now
        // install backbone's `extend` abillity
        // @TODO - check if there is no better way...
        AbstractController.extend = Backbone.View.extend;
        // create common API
        _.extend(AbstractController.prototype, Backbone.Events, {
            initialize: function() {},

            resume: function() {
                // publish 'something' to unlock the app
                // console.log('   => unlock app');
                // com.publish('ui:unlock');
            },

            // keep it as the entry points
            destroy: function() {
                this.removeAllHandlers();
            },

            // make a default cleanning (event listeners, subscribes)
            removeAllHandlers: function() {}
        });


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
            home: function(state, params) {
                // console.timeEnd('start');
                console.log('   =>  controller::home', state, params);
            },

            index: function(state, params) {
                // console.timeEnd('start');
                console.log('   =>  controller::index', state, params);
                // do stuff...

                // unlock app should be done from layout
                // this.resume();
            },

            content: function(state, params) {
                // console.timeEnd('start');
                console.log('   =>  controller::content', state, params);
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
