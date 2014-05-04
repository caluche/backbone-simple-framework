define([
        'backbone',
        'underscore',
        'jquery',
        'when'
    ], function(Backbone, _, $, when) {

        'use strict';

        /**
         *  Transition
         *
         *  allow to simply manage transitions between 2 views in a region
         *  single use object (maybe think Object Pool or something)
         *  is highly coupled with the Region object
         *
         *  @NOTE
         *      maybe the whole logic except `doShow` and `doHide`
         *      could be moved into the Region
         */
        function Transition(region, prevView) {
            this.region = region;
            this.$el = region.$el;
            this.prevView = prevView;

            // kind of state machine with two states ['hide', 'show']
            // this just allow to share the `resume` API
            this.state = 'hide';

            // create promises
            this.hidePromise = this.createHidePromise();
            this.showPromise = this.createShowPromise();

            // the `doShow` method should be called only when
            // the `hideDeferred` and `showDeferred` are resolved
            // showPromise is called first in order to keep correct param order
            // @NOTE    create a wrapper to bind context and stick on `doShow` API
            var show = _.bind(function(args) {
                this.doShow.apply(this, args);
            }, this);

            when.all([this.showPromise, this.hidePromise]).done(show);
        }

        Transition.extend = Backbone.View.extend;

        _.extend(Transition.prototype, {
            // `hidePromise` should be resolved when
            // `this.resume` is called the first time
            createHidePromise: function() {
                var promise = when.promise(_.bind(function(resolve, reject) {
                    this.resolveHidePromise = function(prevView) {
                        resolve(prevView);
                    }
                }, this));

                return promise;
            },

            // `showPromise` should be resolved when `show` is called
            // its value is the nextView object
            // (we can assume this.method is called when assets are loaded)
            createShowPromise: function() {
                var promise = when.promise(_.bind(function(resolve, reject) {
                    this.resolveShowPromise = function(nextView) {
                        resolve(nextView);
                    }
                }, this))

                return promise;
            },

            //  toggle behavior between the 2 states : [hide, show]
            resume: function() {
                switch (this.state) {
                    case 'hide' :
                        this.state = 'show';
                        this.resolveHidePromise(this.prevView);
                        break;
                    case 'show' :
                        this.region.endTransition();
                        break;
                }
            },

            hide: function() {
                if (!this.prevView) {
                    return this.resume();
                }

                this.doHide(this.prevView);
            },

            // this call resolve the showPromise with `nextView`
            show: function(nextView) {
                this.region.setCurrentView(nextView);
                this.resolveShowPromise(nextView);
            },

            // allow to trigger behavior on `nextView`
            // while being sure it's fully rendered
            complete: function(callback) {
                when.all([this.showPromise, this.hidePromise]).done(callback);
            },

            // @OVERRIDE METHODS
            // override the two following methods to create user defined transitions

            // @param   receive `this.prevView` as argument for API consistency
            //          the final user don't need to know that it's available as `this.prevView`
            doHide: function(prevView) {
                prevView.$el.fadeTo(200, 0, _.bind(function() {
                    prevView.$el.remove();

                    if (_.isFunction(prevView.close)) {
                        prevView.close();
                    } else {
                        prevView.remove();
                    }

                    this.resume();
                }, this));
            },

            // allow to work both on `nextView` and `prevView` at the same time
            // this allow to create personnalized transition without being forced
            // to follow the 'hide' -> 'load' -> 'show' scheme
            doShow: function(nextView, prevView) {
                nextView.render();
                nextView.$el.hide();
                this.$el.html(nextView.$el);

                // `onRender` is called internally in the view
                // call `onShow` once the view is in the DOM
                if (_.isFunction(nextView.onShow)) {
                    nextView.onShow();
                }

                nextView.$el.fadeTo(200, 1, _.bind(function() {
                    this.resume();
                }, this));
            }
        });

        return Transition;

    }
);
