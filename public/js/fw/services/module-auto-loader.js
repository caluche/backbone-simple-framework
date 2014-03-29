define(
    [
        'require',
        'backbone',
        'underscore',
        'jquery'
    ],
    function(require, Backbone, _, $) {

        'use strict';

        /**
         *  MODULE AUTO LOADER
         *
         *  Basically a module loader wrapping `require`
         *  deps: require, $.deferred
         */
        var ModuleAutoLoader = function(options) {
            this.paths = options.paths;
            // console.log(this.paths);
        };

        _.extend(ModuleAutoLoader.prototype, Backbone.Events, {

            // @TODO moduleId can also be array
            // execute the callback with loaded modules as arguments
            get: function(moduleId, callback, ctx) {
                // console.log(arguments);
                // get the real module path (according to `config.paths`)
                ctx = ctx || {};

                var modulePath = this.findLocation(moduleId);
                // create a deferred
                var defer = new $.Deferred();

                //
                require([modulePath], function(module) {
                    // console.log(module);
                    defer.resolve(module)
                }, function(err) {
                    // console.log(err)
                    console.error('"' + moduleId + '" with path "' + modulePath + '" not found');
                });

                // on `resolve` execute the callback
                // @NOTE    allow a more common API (moduleIds, callack) for the client
                //          than returning the promise
                defer.done(_.bind(callback, ctx));
            },

            //  look if the filename contains some pattern from `config.path`
            //
            //  @param moduleId <string> name of module (the name can be namespaced '/')
            //  @return  <string>   the full path of the file
            findLocation: function(moduleId) {
                // prefixes
                for (var key in this.paths) {
                    if (moduleId.indexOf(key) === 0) {
                        // remove the key part from file Path
                        var modulePath = moduleId.substr(key.length);
                        // concatenate paths
                        modulePath = this.paths[key] + modulePath;

                        return modulePath;
                    }
                }

                // no match found, moduleId is the path
                return moduleId;
            }
        });

        // testing
        // var testLoader = new ModuleAutoLoader(config.paths);
        // use with a single moduleName
        // testLoader.get('controllers/app', function(controller) {
        //     console.log(controller);
        // });

        return ModuleAutoLoader;
    }
);
