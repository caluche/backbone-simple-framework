define(
    [
        'fw/views/base-view',
    ], function(BaseView) {

        'use strict';

        var AbstractLoader = BaseView.extend({
            id: 'loader',

            constructor: function(config) {
                BaseView.prototype.constructor.apply(this, arguments);

                this.layout = config.layout;
                this.com = config.com;

                this.com.subscribe('transition:start', this.onTransitionStart, this);
                this.com.subscribe('transition:end', this.onTransitionEnd, this);
            },

            onTransitionStart: function() {

            },

            onTransitionEnd: function() {

            }

        });

        return AbstractLoader;
    }
);
