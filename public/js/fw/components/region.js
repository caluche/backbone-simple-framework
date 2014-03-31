define(
    [
        'backbone',
        'underscore',
        'jquery'
    ], function(Backbone, _, $) {

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
         *      this implementation is a test and a filed one
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
            this.currentView = undefined;
            // should implement a kind of `strategy pattern` to allow multiple kind of transitionning
        }

        // steal Backbone's `extend` ability
        Region.extend = Backbone.View.extend;

        _.extend(Region.prototype, {

            ensureEl: function() {
                if (this.$el) { return; }
                this.$el = $(this.el);
            },

            // main public API
            createTransition: function(method, loadingDeferred) {
                var that = this;

                this.ensureEl();
                this.counter = 0;
                this.state = 'hide';
                // find the transition method
                this[method](this.currentView);
                // lock $el
                // newView has been created for a factory when
                loadingDeferred.done(function(newView) {

                });

                // should return a deferred object
            },


            /*
            next: function(callback) {
                this.state = 'pending';
                this.onLoaded = callback;
            }
            */

        });

        return Region;
    }
)
