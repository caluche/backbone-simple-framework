define(
    [
        'backbone',
        'underscore',
        'jquery',
        'fw/components/default-transition'
    ], function(Backbone, _, $, DefaultTransition) {

        'use strict';
        /**
         *  REGION
         *
         *  a region is a part of the layout (could also be used inside a view ?)
         *  its main purpose is to handle switching and transitionning
         *  between two views and communicate ith the layout for loading progress
         *  and transition ending _(the 2 last points still needs to be implemented)_
         *
         *  @NOTE
         *      maybe redefine the responsabilities between Transition et Region
         *      see if Transition could be a reduce to the 2 methods: `show` and `hide`
         *      _decide later as it is an API problem too..._
         *
         *  @QUESTION
         *      must be able to know if `prevView` and `nextView` are
         *      the same objects ?
         */
        function Region(options) {
            this.el = options.el;
            this.com = options.com;
            this.currentView = undefined;
            this.ensureEl();
        }

        // steal Backbone's `extend` ability
        Region.extend = Backbone.View.extend;

        _.extend(Region.prototype, {

            ensureEl: function() {
                if (this.$el) return;

                this.$el = $(this.el);

                if (!this.$el.length) {
                    throw new Error('selector "' + this.$el + '" match no element');
                }
            },

            isEmpty: function() {
                return this.currentView === undefined;
            },

            // methods called internally from the transition
            setCurrentView: function(view) {
                this.currentView = view;
            },

            getCurrentView: function() {
                return this.currentView;
            },
            // alias `getCurrentView`
            getView: function() {
                return this.getCurrentView();
            },

            endTransition: function() {
                // should clean the transition in a way
                // maybe just a call to `this.transition.destroy()` (need to be tested)
                // trigger an event to let the Layout know what appends
                // console.log('   => "region" - end transition');
            },

            // PUBLIC API
            // is basically a factory method to create Transitions
            // @NOTE    if alternate API - this should be renamed `configure`
            createTransition: function(transitionCtor, autohide) {
                switch (arguments.length) {
                    case 0:
                        transitionCtor = DefaultTransition;
                        autohide = false;
                        break;
                    case 1:
                        if (_.isBoolean(transitionCtor)) {
                            autohide = transitionCtor;
                            transitionCtor = DefaultTransition;
                        } else {
                            autohide = false;
                        }
                        break;
                }

                var transition = new transitionCtor(this, this.currentView);
                if (autohide) { transition.hide(); }

                //  @TODO layout must keep track of transitions in a way
                return transition;
            },

            // entry point for extend
            destroy: function() {
                this.close();
            },

            close: function() {
                if (_.isFunction(this.currentView.close)) {
                    this.currentView.close();
                } else {
                    this.currentView.remove();
                }
            }

        });

        return Region;
    }
)
