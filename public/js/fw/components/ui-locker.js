define(
    [
        'fw/core/com'
    ], function(com) {

        'use strict';

        /**
         *  UILocker
         */
        // could be a Backbone.View with `window` or `document` as `$el` to use Backbone's jQuery instance
        var UILocker = function() {
            //  subscribe to `app:lock` and `app:unlock` channels
            com.subscribe('ui:lock', this.lock, this);
            com.subscribe('ui:unlock', this.unlock, this);
        }

        UILocker.prototype = {
            // lock user interactions
            // app should be locked from the Disptacher
            lock: function() {},
            // and unlocked from the Layout (once all Regions finished their transitions (cf. `_.times`))
            // Layout should subscribe to all channels from Dispatcher and Loader
            unlock: function() {},
        }

        return UILocker;

    }
)
