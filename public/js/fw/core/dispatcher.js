define(
    [
        'backbone',
        'fw/core/com'
    ], function(Backbone, com) {

        'use strict';

        /**
         *  DISPATCHER
         *  -------------------------------------------------------
         *  find the state and the according controller
         *  destroy the previous controller if different
         *  instanciate the controller and calls its `action` method
         *
         *  EVENTS: dispatch events before and after dispatch to allow easy plug-in
         *
         *  the dispatcher (and layout) use `require` to load and use modules
         *  @NOTE - it should use a service wrapping `require.js` to load modules
         *  (`config.paths` allow to map `controllers` with the file system)
         *
         *  http://stackoverflow.com/questions/9507606/when-to-use-require-and-when-to-use-define
         *  @NOTE - can create problems with r.js ?
         */
        var Dispatcher = function(options) {
            this.states = options.states;

            // @TODO    this should be dependecies of the controllerFactory
            this.layout = options.layout;
            this.assetsManager = options.assetsManager;
            this.services = options.services;

            //
            this.prevController;
            this.prevRequest;

            this.isExecutionCanceled = false;
            this.commonControllers = [];
            this.controllers = {};

            // @EVENT : listen `route:change` from router
            com.subscribe('router:change', this.dispatch, this);
        }

        _.extend(Dispatcher.prototype, Backbone.Events, {
            // factory method to instanciate a controller
            createController: function(ctor) {
                var instance = new ctor({
                    layout: this.layout,
                    services: this.services,
                    assetsManager: this.assetsManager
                });

                return instance;
            },
            // find a controller constructor by id
            getController: function(id) {
                var ctor = this.controllers[id];

                if (!ctor) {
                    throw new Error('controller "' + id + '" is not registered');
                }

                return ctor;
            },

            // install controllers to be called on each route
            // `action` once then `update` forever
            installCommonController: function(ctor) {
                var instance = this.createController(ctor);
                this.commonControllers.push(instance);
                // return the instance to the framework
                return instance;
            },

            registerController: function(id, ctor) {
                this.controllers[id] = ctor;
            },

            // returns the command from a 'controller::action' pattern
            getCommand: function(pattern) {
                var parts = pattern.split('::');

                return {
                    controller: parts[0],
                    action: parts[1]
                };
            },

            // should be able to cancel dispatching in some preDispatch method
            cancelExecution: function() {
                this.isExecutionCanceled = true;
            },

            //  find the pair `controller.action` and execute it
            dispatch: function(request) {
                // reset cancel ability
                this.isExecutionCanceled = false;

                // process the command for controller::action
                var command = this.getCommand(request.state.controller);
                request.command = command;

                // if (this.isExecutionCanceled) { return; }
                this.findController(request);
            },

            // compare the new controller with previous one
            // loads the new controller object and destroy last one if needed
            // @TODO    if multirouting (cannot work properly for now)
            //          just instanciate the second controller,
            //          store their references only to destroy it cleanly
            findController: function(request) {
                if (this.isExecutionCanceled) { return; }

                if (
                    !this.prevRequest ||
                    (this.prevRequest.command.controller !== request.command.controller)
                ) {
                    // cannot be an 'update' while its's a new controller
                    request.command.method = 'show';

                    var ctor = this.getController(request.command.controller);
                    var instance = this.createController(ctor);
                    this.execute(instance, request);

                    // destroy prev controller
                    if (this.prevController) {
                        this.prevController.destroy();
                    }
                } else {
                    // if the action is the same as in the prevRequest : call `update` method
                    request.command.method = (this.prevRequest.command.action === request.command.action) ? 'update' : 'show';
                    this.execute(this.prevController, request);
                }
            },

            // actually execute controller:action command
            execute: function(instance, request) {
                // @EVENT - entry point
                // could be used in a plugin/service to create repetive tasks
                com.publish('dispatcher:beforeDispatch', request, this.prevRequest);

                // execute all the registered `commonControllers`
                this.executeCommonControllers(request, this.prevRequest);

                // close the previous controller if needed
                if (this.prevRequest && (
                        this.prevRequest.command.controller !== request.command.controller ||
                        this.prevRequest.command.action !== request.command.action
                    )
                ) {
                    var closeMethod = this.prevController.actions[this.prevRequest.command.action].close;
                    if (_.isFunction(closeMethod)) { closeMethod.apply(this.prevController); }
                }

                // call the `beforeAction` method
                instance.beforeAction(request, this.prevRequest);

                var actionMethod = instance.actions[request.command.action][request.command.method];

                if (_.isFunction(actionMethod)) {
                    actionMethod.call(instance, request, this.prevRequest);
                }

                //  @EVENT - entry point
                //  must be triggered only once after each controllers
                //  is used by layout to control transitions
                com.publish('dispatcher:afterDispatch', request, this.prevRequest);

                this.prevRequest = request;
                this.prevController = instance;
            },

            //
            closeController: function(controller, command) {

            },

            // ugly but will work for now
            // @TODO    refactor
            isFirstCall: true,

            executeCommonControllers: function(request, prevRequest) {
                var method = this.isFirstCall ? 'show' : 'update';

                // refactor this -> ugly
                _.forEach(this.commonControllers, function(controller, index) {
                    var controller = this.commonControllers[index];
                    var actions = controller.actions;

                    _.forEach(actions, function(obj, action) {
                        if (_.isFunction(actions[action][method])) {
                            actions[action][method].call(controller, request, prevRequest);
                        }
                    }, this);
                }, this);

                this.isFirstCall = false;
            },

            // the following is redondant with event system... keep it or not ?
            // execute all the registered methods for predispatch
            _preDispatch: function() {},

            // execute all the registered methods for postdispatch
            _postDispatch: function() {},

            //  allow to register method for pre|post dispatching
            //  @param type <string> [predispatch|postdispatch] which queue to add the callback
            //  @param callback <function> function to be executed on predispatch or postdispatch
            //      receive route, args, state as arguments
            register: function(type, callback, ctx) {},
        });

        return Dispatcher;

    }
)
