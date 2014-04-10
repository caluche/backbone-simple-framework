(function() {

    //  define environment configuration
    //  parse url, etc...
    //  init requirejs with env config
    requirejs.config({
        // store here env variable that could be usefull to the framework
        config: {
            main: {
                // can be accessed in `main.js` from `module.config()`
                env: 'dev',
                debug: true,
                minify: false
            }
        },

        // traditionnal requirejs config
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
            },
            fw: {
                deps: ['backbone', 'when']
            },
            createjs: {
                exports: 'createjs'
            }
        },
        packages: [
            { name: 'when', location: 'vendors/when', main: 'when' }
        ],
        paths: {
            jquery: 'vendors/jquery/dist/jquery',
            underscore: 'vendors/underscore/underscore',
            backbone: 'vendors/backbone/backbone',
            text: 'vendors/requirejs-text/text',
            createjs: 'vendors/PreloadJS/lib/preloadjs-0.4.1.min',
            fw: 'fw',
            templates: '../templates'
        },
    });

    require(['main'], function() {
        // console.log('main loaded');
    });

}());
