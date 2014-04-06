define([
        'backbone',
        'underscore',
        'jquery'
        // 'fw/core/com'
    ], function(Backbone, _, $) {

        'use strict';

        /**
         *  Transition
         *
         *  allow to simply manage transitions between 2 views in a region
         *  single use object (maybe think Object Pool for these)
         *  is highly coupled with the Region object
         *
         *  @NOTE
         *      maybe the whoole logic except `doShow` and `doHide`
         *      can be moved into the Region
         */
        function Transition(region, prevView) {
            this.region = region;
            this.$el = region.$el;
            this.prevView = prevView;

            // create promises
            this.hidePromise = this.createHidePromise();
            this.showPromise = this.createShowPromise();
            // kind of state machine with two states ['hide', 'show']
            // this just allow to share the `resume` API
            this.state = 'hide';
            // the `doShow` method should be called only when
            // the `hideDeferred` and `showDeferred` are resolved
            // showPromise is called first in order to keep correct param order
            var show = _.bind(this.doShow, this);
            $.when(this.showPromise, this.hidePromise).done(show);
        }

        Transition.extend = Backbone.View.extend;

        // the chain is :
        //     hideDeferred -> then -> showDeferred
        // need 2 parallel promises

        _.extend(Transition.prototype, {
            // `hidePromise` whould be resolved
            // when `this.resume` is called
            // the first time
            createHidePromise: function() {
                this.hideDeferred = new $.Deferred();
                return this.hideDeferred.promise();
            },

            // `showPromise` should be resolved
            // when show is called
            // - its value is the nextView object
            // (we can assume this.method is called when assets are loaded)
            createShowPromise: function() {
                this.showDeferred = new $.Deferred();
                return this.showDeferred.promise();
            },

            //  toggle behavior between states [hide, show]
            resume: function() {
                // console.log('state:', this.state);
                switch (this.state) {
                    case 'hide' :
                        this.state = 'show';
                        this.hideDeferred.resolve();
                        break;
                    case 'show' :
                        this.region.endTransition();
                        break;
                }
            },

            hide: function() {
                if (!this.prevView) {
                    // resume now
                    this.resume();
                    return;
                }

                this.doHide(this.prevView);
            },

            // this call resolve the showPromise with `nextView`
            show: function(nextView) {
                this.region.setCurrentView(nextView);
                this.showDeferred.resolve(nextView);
            },


            // @OVERRIDE METHODS
            // override the two following methods to
            // create user defined transitions
            //
            // @param   receive `this.prevView` as argument for API consistency
            doHide: function(prevView) {
                prevView.$el.fadeTo(300, 0, _.bind(function() {
                    prevView.$el.remove();
                    prevView.close();

                    this.resume();
                }, this));
            },

            doShow: function(nextView) {
                nextView.render();
                nextView.$el.hide();
                nextView.$el.appendTo(this.$el);

                nextView.$el.fadeTo(300, 1, _.bind(function() {
                    this.resume();
                }, this));
            }
        });

        return Transition;

    }
)
