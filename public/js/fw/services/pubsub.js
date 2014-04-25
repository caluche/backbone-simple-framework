define([
        'backbone'
    ], function(Backbone) {

        'use strict';

        /**
         *  PUBSUB
         *
         *  basically a Backbone.Events with a pubsub interface (alias method signatures)
         *  (looks more meaningfull for this kind of functionnality)
         *  allow decoupling as well as publishing the internal state of the framework for plugins
         */
        var PubSub = function() {};

        _.extend(PubSub.prototype, Backbone.Events, {
            // alias `trigger`
            publish: function() {
                var args = Array.prototype.slice.call(arguments, 0);
                this.trigger.apply(this, args);
            },

            // alias `on`
            subscribe: function() {
                var args = Array.prototype.slice.call(arguments, 0);
                this.on.apply(this, args);
            },

            // alias `off`
            unsubscribe: function() {
                var args = Array.prototype.slice.call(arguments, 0);
                this.off.apply(this, args)
            },

            // added methods
            // --------------------------------------------------------
            // kind of log system should be able to :
            //      - trace a route
            //      - a specific object of the framework (a specific namespace)
            //      - make a list of existing channels with their related subscriptions
            //      - ...
            trace: function(key) {},
            // remove all subscriptions of an object at once
            removeHandler: function(obj) {
                // needs to be tested
                this.off(null, null, ctx);
            }
        });

        return PubSub;

    }
);
