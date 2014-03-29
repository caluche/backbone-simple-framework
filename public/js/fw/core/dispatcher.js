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
            //  map the filesystem with namespaces (basically allow factories to work)
            this.paths = options.paths;
            //  store references to framework plugins and services
            //  allow controllers to use services
            //  @TODO   host `services`, `plugins` ... clean that
            this.services = options.services;

            this.previousCommand = {};
            this.previousController;
            this.isExecutionCanceled = false;

            // @EVENT : listen route:change
            com.subscribe('router:change', this.dispatch, this);
        }

        _.extend(Dispatcher.prototype, Backbone.Events, {
            //  find the pair `controller.action` and execute it
            dispatch: function(stateId, params, options) {
                // console.log(options.controllers);
                // reset cancel ability
                this.isExecutionCanceled = false;
                // @NOTE: param should already be an named object
                var state = this.getState(stateId);
                var parts = state.controller.split('::');
                var command = {
                    controller: parts[0],
                    action: parts[1]
                };

                // @EVENT - entry point
                // publish dispatch - this allow to alter `command`, `state`, `params` before actual dispatching
                // could be used to monitor some global stuff (user access, ...)
                // @TODO allow routing alteration
                com.publish('dispatcher:beforeLoad', state, params, this);
                // if (this.isExecutionCanceled) { return; }

                // dispatch event to allow loader plug-in
                // load assets
                // when done dispatch another event
                // ... this will be async (assets loading)
                // @TODO params could added to the state at this point
                this.findController(command, state, params);
            },

            //  @NOTE - allow access to the controllers ?
            getState: function(stateId) {
                return this.states[stateId];
            },

            // should be able to cancel dispatching in some preDispatch method
            cancelExecution: function() {
                this.isExecutionCanceled = true;
            },

            // @TODO handle 404 not found
            // compare new controller with previous one
            // destroy last one if different
            findController: function(command, state, params) {
                if (this.isExecutionCanceled) { return; }

                var controller = command.controller;
                // console.log(this.previousCommand.controller !== controller)
                if (this.previousCommand.controller !== controller) {
                    // @NOTE    maybe could be more efficiant with multi-routing
                    //          if multirouting :
                    //              just instanciate controller, store their references only to destroy it
                    if (this.previousController) {
                        this.previousController.destroy();
                    }

                    var moduleLoader = this.services.get('core:moduleLoader');

                    var execute = _.partial(this.execute, command, state, params);

                    // create a new controller instance
                    var instanciate = function(ctor) {
                        var instance = new ctor({
                            layout: this.layout,
                            services: this.services
                        });

                        this.execute(instance, command, state, params);
                    }
                    // as moduleLoader is async there is no garanty that
                    // controllers will be executed in same order as routes
                    moduleLoader.get(controller, instanciate, this);
                } else {
                    //  @TODO
                    //      check if this is exact same action with same params
                    //      if same params : cancelExecution
                    //      if not : give the info to the controller
                    this.execute(this.previousController, command, state, params);
                }
            },

            // actually execute controller:action command
            execute: function(instance, command, state, params) {
                // this can be async
                // store infos
                var action = command.action;

                this.previousCommand = command;
                this.previousController = instance;
                this.previousParams = params;

                // @EVENT - entry point
                // can be used in a controller to create repetive tasks
                // channel should be 'dispatcher:beforeDispatch'
                com.publish('dispatcher:beforeDispatch', instance, action, state, params);
                // call a specific controller::action
                // @TODO should `utils.ensureApi`
                //       if controller is not found redirect to not found
                instance[action](state, params);

                // @EVENT - entry point
                com.publish('dispatcher:afterDispatch', instance, action, state, params);
            },


            // the following is redondant with event system...

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
