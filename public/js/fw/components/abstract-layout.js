define(
    [
        'backbone',
        'underscore',
        'jquery',
        'fw/views/model-view',
        'fw/components/region'
    ], function(Backbone, _, $, ModelView, Region) {

        'use strict';

        /**
         *  ABSTRACT LAYOUT
         *
         *  the layout is a host for regions
         *  its primary goal is to handle the main layout of the website
         *  but as it's a view it can probably be used inside a view
         */
        var AbstractLayout = ModelView.extend({
            el: 'body', // default - can be overriden

            constructor: function(params) {
                ModelView.prototype.constructor.apply(this, arguments);

                this.regions = params.regions || {};
                this.regionsInstances = {};
                this.configureRegions();
            },
            // create a Region object foreach configured regions
            configureRegions: function() {
                var regionsDefinitions = this.regions || {};

                _.each(regionsDefinitions, function(selector, name) {
                    this.addRegion(name, selector);
                }, this);
            },

            getRegion: function(name) {
                if (!this.regionsInstances[name]) {
                    throw new Error('Region "' + name + '" does not exists');
                }

                return this.regionsInstances[name];
            },

            removeRegion: function(name) {
                var region = this.regionsInstances[name];
                if (!region) return;

                region.destroy();
                // remove from stack - `delete` seems to be performance problem
                this.regionsInstances[name] = undefined;
            },

            addRegion: function(name, selector) {
                var $el = this.$(selector);

                if (this.regionsInstances[name]) {
                    this.removeRegion(name)
                }

                this.regionsInstances[name] = new Region({ el: $el });
            },

            // @TODO
            remove: function() {

            }

            // check to see if the followings are usefull
            // render: function() {},
            // close: function() {},
            // closeRegions: function() {},

        });

        return AbstractLayout;
    }
);
