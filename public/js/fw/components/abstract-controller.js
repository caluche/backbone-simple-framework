define(
    [
        'backbone',
        'underscore'
    ], function(Backbone, _) {

        'use strict';
        /*
         *  AbstractController
         *  -------------------------------------------------------
         *
         *  @TODO
         *      must have the ability to call some kind of `update` stuff
         *      when same route is called with different params
         *
         *  application controllers should be extended from this object
         *  allows to have higher control of the current state and remove many logic from the view
         *  finally allowing to use more simple and efficient views
         *
         *  MyController = FW.AbstractController.extend({
         *      // action
         *      index: function(route, params) {
         *          // has internal access to :
         *          // this.layout
         *          // this.state (backbone model ?)
         *          // this.services.get('') // to get a global service
         *
         *          // build models according to params
         *          // get views from the factory (use requirejs path as id)
         *       }
         *   });
         */

        /**
         *  // CONTROLLER - API USE EXAMPLE
         *  testAction: function() {
         *      var myRegion = this.layout.get('myRegion');
         *      var myAsset = this.assets.get('myAsset');
         *
         *      // params: name of the transition method, autoHide
         *      // `myTransition` must be a ref to a `Transition` object
         *      var transition = myRegion.createTransition(myTransition, false);
         *      transition.hide(); // or `myRegion.show()` ?
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
         *          transition.show(myView); // or `myRegion.hide(myView)` ?
         *      }, this);
         *  }
         */

        var AbstractController = function(options) {
            options = (options || {});
            // set layout
            this.layout = options.layout;
            this.com = options.com;
            this.services = options.services;
            // @NOTE    `this.assets` could be the current assetCollection for the state,
            //          while `this.assetsManager` should be the real service
            this.assets = options.assetsManager;

            this.initialize(options);
        };

        // install backbone's `extend` abillity
        // @TODO - check if there is no better way...
        AbstractController.extend = Backbone.View.extend;
        // create common API
        _.extend(AbstractController.prototype, Backbone.Events, {
            initialize: function() {},

            /*
            resume: function() {
                // publish 'something' to unlock the app
                // console.log('   => unlock app');
                com.publish('ui:unlock');
            },
            */

            // keep it as the entry points
            destroy: function() {
                this.removeAllHandlers();
            },

            // make a default cleanning (event listeners, subscribes)
            removeAllHandlers: function() {
                this.off(null, null, this);
                this.stopListening();
            },

            // is called before each action on a given controller
            // can be used to set params on assets
            beforeAction: function(request, prevRequest) {}
        });

        return AbstractController;

    }
);
