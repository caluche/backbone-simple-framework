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
            this.layout = options.layout;
            //  map the filesystem with namespaces (basically allow factories to work)
            this.paths = options.paths;
            //  store references to framework plugins and services
            //  allow controllers to use services
            //  @TODO   host `services`, `plugins` ... clean that
            this.services = options.services;

            this.prevController;
            this.prevRequest;

            this.isExecutionCanceled = false;
            this.commonControllers = [];

            // @EVENT : listen `route:change` from router
            com.subscribe('router:change', this.dispatch, this);
        }

        _.extend(Dispatcher.prototype, Backbone.Events, {
            // factory method to instanciate a controller
            createController: function(ctor) {
                var instance = new ctor({
                    layout: this.layout,
                    services: this.services
                });

                return instance;
            },

            // install controllers to be called on each route
            // `action` once then `update` for the whole time
            installController: function(ctor) {
                var instance = this.createController(ctor);
                this.commonControllers.push(instance);
                // return the instance to the framework
                return instance;
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
                console.log(request);
                // reset cancel ability
                this.isExecutionCanceled = false;

                // process the command for controller::action
                var command = this.getCommand(request.state.controller);
                request.command = command;

                // @EVENT - entry point
                // publish dispatch
                // could be used to monitor some global stuff (user access, ...)
                // @TODO check for routing alteration possibility
                com.publish('dispatcher:beforeLoad', request, this);
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

                    if (this.prevController) {
                        this.prevController.destroy();
                    }

                    // as moduleLoader is async there is no garanty that
                    // controllers will be executed in same order as routes
                    var moduleLoader = this.services.get('core:moduleLoader');
                    // not found handling should be done here ?
                    moduleLoader.get(request.command.controller, _.bind(function(ctor) {
                        // get the controller instance
                        var instance = this.createController(ctor);
                        // execute new controller
                        this.execute(instance, request);
                    }, this));

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

                // @EVENT - entry point
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
                    _.forEach(this.commonControllers[index].actions, function(obj, action) {
                        if (_.isFunction(this.commonControllers[index].actions[action][method])) {
                            this.commonControllers[index].actions[action][method].call(this.commonControllers[index], request, prevRequest);
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
