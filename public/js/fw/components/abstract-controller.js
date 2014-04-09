define(
    [
        'backbone',
        'underscore'
    ], function(Backbone, _) {

        'use strict';
        /*
         *  AbstractController
         *  -------------------------------------------------------
         *
         *  @TODO
         *      must have the ability to call some kind of `update` stuff
         *      when same route is called with different params
         *
         *  application controllers should be extended from this object
         *  allows to have higher control of the current state and remove many logic from the view
         *  finally allowing to use more simple and efficient views
         *
         *  MyController = FW.AbstractController.extend({
         *      // action
         *      index: function(route, params) {
         *          // has internal access to :
         *          // this.layout
         *          // this.state (backbone model ?)
         *          // this.services.get('') // to get a global service
         *
         *          // build models according to params
         *          // get views from the factory (use requirejs path as id)
         *       }
         *   });
         */
        var AbstractController = function(options) {
            var options = options || {};
            // set layout
            this.layout = options.layout;
            this.services = options.services;

            this.initialize(options);
        };

        // install backbone's `extend` abillity
        // @TODO - check if there is no better way...
        AbstractController.extend = Backbone.View.extend;
        // create common API
        _.extend(AbstractController.prototype, Backbone.Events, {
            initialize: function() {},

            /*
            resume: function() {
                // publish 'something' to unlock the app
                // console.log('   => unlock app');
                com.publish('ui:unlock');
            },
            */

            // keep it as the entry points
            destroy: function() {
                this.removeAllHandlers();
            },

            // make a default cleanning (event listeners, subscribes)
            removeAllHandlers: function() {}
        });

        return AbstractController;

    }
);
