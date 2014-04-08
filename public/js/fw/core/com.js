define(
    [
        'fw/services/pubsub'
    ], function(PubSub) {

        'use strict';

        /**
         *  COMMUNICATION - FRAMEWORK'S EVENT AGREGATOR
         *
         *  is basically a Backbone.Events object mixed
         *  with a PubSub interface
         */
        var com;

        if (!com) {
            com = new PubSub();
        }

        return com;
    }
);
