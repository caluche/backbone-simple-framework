define(
    [
        'backbone',
        'underscore',
        'jquery'
    ], function(Backbone, _, $) {

        'use strict';

        /**
         *  REGION
         *
         *  a region is a part of the layout (could also be used inside a view ?)
         *  its main purpose is to handle switching and transitionning
         *  between two views
         *
         *  the public
         */
        function Region(options) {
            this.el = options.el;
            this.currentView = undefined;
            // should be a kind of `strategy pattern` to allow multiple kind of transitionning
        }

        // steal Backbone's `extend` ability
        Region.extend = Backbone.View.extend;

        _.extend(Region.prototype, {

            ensureEl: function() {
                if (this.$el) { return; }
                this.$el = $(this.el);
            },

            // main public API
            makeTransition: function(newView, transitionId) {
                this.ensureEl;

                // find the transition method

                // lock $el

                // should return a deferred object
            },

        });

        return Region;
    }
)
