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
         *
         *  Must be able to know the state of the transitions occuring in it's regions to:
         *  - lock the app
         *  - synchonize the `transition.show` methods
         */
        var AbstractLayout = ModelView.extend({
            el: 'body', // default - can be overriden

            constructor: function(params) {
                ModelView.prototype.constructor.apply(this, arguments);

                this.regionsConfiguration = params.regions || {};
                this.regionsConfiguration['body'] = 'body';
                this.regions = {};

                this.createRegions();
            },

            // create a Region object foreach configured regions
            createRegions: function() {
                _.each(this.regionsConfiguration, function(selector, name) {
                    this.addRegion(name, selector);
                }, this);
            },

            getRegion: function(name) {
                if (!this.regions[name]) {
                    throw new Error('Region "' + name + '" does not exists');
                }

                return this.regions[name];
            },

            removeRegion: function(name) {
                var region = this.regions[name];
                if (!region) return;

                region.destroy();
                // remove from stack - `delete` seems to be performance problem
                this.regions[name] = undefined;
            },

            addRegion: function(name, selector) {
                if (this.regions[name]) {
                    this.removeRegion(name)
                }

                this.regions[name] = new Region({ el: selector });
            },

            // @TODO
            remove: function() {},

            render: function() {
                if (!this.template) { return; }
                ModelView.prototype.render.call(this);
            }

            // check to see if the followings are usefull
            // render: function() {},
            // close: function() {},
            // closeRegions: function() {},

        });

        return AbstractLayout;
    }
);
