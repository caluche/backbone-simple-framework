define(
    [
        'backbone',
        'underscore',
        'jquery',
        'fw/components/transition'
    ], function(Backbone, _, $, DefaultTransition) {

        'use strict';
        /**
         *  testAction: function() {
         *      var myRegion = this.layout.get('myRegion');
         *      var myAsset = this.assets.get('myAsset');
         *
         *      // params: name of the transition method, autoHide
         *      var transition = myRegion.createTransition('myTransition', false);
         *      transition.hide();
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
         *          transition.show(myView);
         *      }, this);
         *  }
         */

        /**
         *  REGION
         *
         *  a region is a part of the layout (could also be used inside a view ?)
         *  its main purpose is to handle switching and transitionning
         *  between two views
         *
         *  the public
         *
         *  kind of finite state machine : 'hide', 'pending', 'show'
         *
         *  @IMPORTANT:
         *      this implementation is a test and a failled one
         *      the controller must be able to create it's views
         *      in some way (even from a factory)
         *      as the loading is async the new view cannot be created
         *      when the controller is called... must find a solution for
         *      that problem
         */

        // ------------------------------------------

        // ------------------------------------------

        function Region(options) {
            this.el = options.el;
            this.com = options.com;
            this.currentView = undefined;
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

            // methods called internally from the transition
            setCurrentView: function(view) {
                this.currentView = view;
            }

            endTransition: function() {
                // trigger an event to let the app know
                console.log('   => "region" - end transition');
            }

            // PUBLIC API
            // is absically a factory method to create Transitions
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

                if (autohide) {
                    transition.hide();
                }

                return transition;
            },

        });

        return Region;
    }
)
