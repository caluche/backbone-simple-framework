define(
    [
        'backbone',
        'underscore',
        'when',
        'fw/views/model-view',
        'fw/components/region',
    ], function(Backbone, _, when, ModelView, Region) {

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
         *      this can be done if it knows all the asset loading
         *
         *  @EVENTS:
         *      subscriptions `disptacher:afterDipatch`
         *      publish       `transition:start`
         *                    `transition:end` (for loader)
         */
        var AbstractLayout = ModelView.extend({
            el: 'body', // default - can be overriden

            constructor: function(config) {
                ModelView.prototype.constructor.apply(this, arguments);

                this.com = config.com;
                this.regionsConfiguration = config.regions || {};
                this.regionsConfiguration['body'] = 'body';
                this.regions = {};
                this.transitionStack = [];

                this.createRegions();

                // subscribe to this channel to synchronise transition resolution
                // we are sure at this moment that every controller has been called
                this.com.subscribe('dispatcher:afterDispatch', this.resolveTransitions, this);
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

            // should destroy the DOM element
            removeRegion: function(name) {
                var region = this.regions[name];
                if (!region) return;

                region.destroy();
                // remove from stack - `delete` seems to be performance problem
                this.regions[name] = undefined;
            },

            // this must be improved we should be able to create
            // the DOM element as well
            addRegion: function(name, selector) {
                if (this.regions[name]) {
                    this.removeRegion(name)
                }

                this.regions[name] = new Region({ el: selector });
            },

            // shortcut form region.createTransition
            // but transitions created this way should be able
            // to be synchronized
            // @API     signature can also be (regionName, autohide)
            createTransition: function(regionName, transitionCtor, autohide) {
                var region = this.regions[regionName];
                var args = _.toArray(arguments).slice(1);
                var transition = region.createSynchronizedTransition.apply(region, args);

                this.registerTransition(transition);
                return transition;
            },

            // create a stack of all the show Promise
            registerTransition: function(transition) {
                this.transitionStack.push(transition);
            },

            // resolve all transition created during the routing call at the same time
            // allow to synchronize view shows among the whole layout
            resolveTransitions: function() {
                if (!this.transitionStack.length) { return; }
                this.com.publish('transition:start');

                var promises = _.pluck(this.transitionStack, 'donePromise');
                var that = this;

                when.all(promises).done(_.bind(function() {
                    this.com.publish('transition:end');

                    _.forEach(arguments[0], function(args, index) {
                        var transition = this.transitionStack[index];
                        transition.doShow.apply(transition, args);
                    }, this);

                    this.transitionStack = [];
                }, this));
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
