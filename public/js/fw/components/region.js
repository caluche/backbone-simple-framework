define(
    [
        'backbone',
        'underscore',
        'jquery',
        'fw/components/default-transition'
    ], function(Backbone, _, $, DefaultTransition) {

        'use strict';
        /**
         *  // example controller - API use model
         *  testAction: function() {
         *      var myRegion = this.layout.get('myRegion');
         *      var myAsset = this.assets.get('myAsset');
         *
         *      // params: name of the transition method, autoHide
         *      // `myTransition` must be a ref to a `Transition` object
         *      var transition = myRegion.createTransition(myTransition, false);
         *      transition.hide(); // or `myRegion.show()` ?
         *
         *      // this.assets.on('load') should also be trigerred
         *      // maybe must hide a deferred object
         *      myAsset.on('load', function(asset) {
         *          var myModel = new Backbone.Model(asset);
         *          var myView = new ModelView({
         *              model: myModel
         *          });
         *
         *          // is actually an internal call to `defer.resolve` in `transition`
         *          transition.show(myView); // or `myRegion.hide(myView)` ?
         *      }, this);
         *  }
         */

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
            // @note bad idea: will break code consumming it
            // should lock UI instead...
            // this.isTransitioning = false;
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

            endTransition: function() {
                // should clean the transition in a way
                // maybe just a call to `this.transition.destroy()` (need to be tested)
                // trigger an event to let the Layout know what appends
                console.log('   => "region" - end transition');
            },

            // PUBLIC API
            // is basically a factory method to create Transitions
            // @NOTE    if alternate API - this should be renamed `configure`
            createTransition: function(transitionCtor, autohide) {
                this.ensureEl();

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

                if (autohide/* || (this.currentView === undefined) */) {
                    transition.hide();
                }

                return transition;
            }

        });

        return Region;
    }
)
