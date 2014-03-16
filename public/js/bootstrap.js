(function() {

    //  define environment configuration
    //  parse url, etc...
    //  store some config for the app in require : http://requirejs.org/docs/api.html#config-moduleconfig ?

    //  init requirejs with env config
    requirejs.config({
        env: {
            // any env config usefull to the app
        },
        urlArgs: 'bust=' + new Date().getTime(),
        baseUrl: 'js',
        shim: {
            jquery: {
                exports: '$'
            },
            underscore: {
                exports: '_'
            },
            backbone: {
                deps: ['jquery', 'underscore'],
                exports: 'Backbone'
            }
        },
        paths: {
            jquery: 'vendors/jquery/dist/jquery',
            underscore: 'vendors/underscore/underscore',
            backbone: 'vendors/backbone/backbone',
            text: 'vendors/requirejs-text/text',
            elipse: 'vendors/elipse'
        },
        config: {
            main: {
                // show some env variables to the app
            }
        }
    });

    require(['main'], function() {
        // console.log('main loaded');
    });

}());
