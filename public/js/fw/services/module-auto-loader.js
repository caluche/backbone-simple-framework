define(
    [
        'require',
        'backbone',
        'when'
    ],
    function(require, Backbone, when) {

        'use strict';

        /**
         *  MODULE AUTO LOADER
         *
         *  Basically a module loader wrapping `require`
         *  deps: require, $.deferred
         */
        var ModuleAutoLoader = function(framework, options) {
            console.log(arguments);
            this.paths = options.paths;
            // console.log(this.paths);
        };

        _.extend(ModuleAutoLoader.prototype, Backbone.Events, {

            // @TODO moduleId could also be an array
            // execute the callback with loaded modules as arguments
            get: function(moduleId, callback) {
                // get the real module path (according to `config.paths`)
                var modulePath = this.findLocation(moduleId);
                // create a deferred
                var promise = when.promise(function(resolve, reject) {
                    require([modulePath], function(module) {
                        resolve(module);
                    }, function(err) {
                        reject(err);
                    });
                });

                // on `resolve` execute the callback
                // @NOTE    allow a more common API (moduleIds, callback) for consuming code
                //          than returning directly the promise
                promise.done(callback);
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
