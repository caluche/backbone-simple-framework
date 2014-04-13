define(
    [
        'backbone',
        'underscore'
    ], function(Backbone, _) {

        'use strict';

        /**
         *  UI LOCKER
         *
         *  Looks like there is no waay to use `usecapture` = true with jQuery
         *  must use `addEventListener` and fallback to `attachEvent` for IE8
         *
         *  @NOTE   `BaseView` should host an instance of `UILocker`
         *          the `layout.UILocker` should subscribe to the
         *          right channels in it's `initialize` method
         *          override `this.lockedEvents` for alternative use
         *
         *  @IMPORTANT  IE8 and below cannot support this fonctionnality
         *              IE event model only bubbles
         *  cf. http://stackoverflow.com/questions/3638141/emulate-w3c-event-capturing-model-in-ie
         *      http://stackoverflow.com/questions/6354079/event-capturing-with-jquery
         */
        var UILocker = function(options) {
            this.$el = $(options.el || 'body');
            this.el = this.$el[0];

            if (_.isArray(options.lockedEvents)) {
                this.lockedEvents = options.lockedEvents;
            }

            this.initialize();
        }

        UILocker.extend = Backbone.View.extend;

        _.extend(UILocker.prototype, {
            // @TODO : needs to be completed
            lockedEvents: ['click', 'hover', 'focus'],
            // entry point for extention
            initialize: function() {},

            bypass: function(e) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            },

            // lock user interactions
            // app should be locked from the Disptacher
            lock: function() {
                if (!('addEventListener' in this.el)) { return; }

                var index = this.lockedEvents.length;
                while (index--) {
                    this.el.addEventlistener(this.lockedEvents[index], this.bypass, true);
                }
            },

            // and unlocked from the Layout (once all Regions finished their transitions (cf. `_.times`))
            // Layout should subscribe to all channels from Dispatcher and Loader
            unlock: function() {
                if (!('addEventListener' in this.el)) { return; }

                var index = this.lockedEvents.length;
                while (index--) {
                    this.el.removeEventlistener(this.lockedEvents[index], this.bypass, true);
                }
            },
        });

        return UILocker;

    }
)
