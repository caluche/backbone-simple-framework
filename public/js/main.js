define(
    [
        'module',
        'config',
        'fw/fw'
    ], function(module, config, FW) {

        'use strict';


        //  get env config from requirejs
        var env = module.config();
        // ---------------------------------------------
        // wait for the DOM
        $('document').ready(function() {
            // intialize the framework
            FW.initialize(config, env);
            // call these directly or through config extend
            // FW.setLayout(MyAppLayout);
            // FW.setAppController(MyAppController);

            // install plugins
            // FW.install('analytics', MyPluginCtor);

            /**
             *  // example:
             *  var TestPlugin = function(options) {
             *      this.name = 'plugin-test';
             *
             *      options._com.subscribe('router:change', function() {
             *          console.log('   ->  from plugin', arguments, this)
             *      }, this);
             *  }
             *
             *  // install
             *  FW.install('test-plugin', TestPlugin);
             */

            // start the whole stuff
            Backbone.history.start();
        });
    }
);
