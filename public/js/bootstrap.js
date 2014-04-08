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
            'jquery': {
                exports: '$'
            },
            'underscore': {
                exports: '_'
            },
            'es6-promise': {
                exports: 'Promise'
            },
            'backbone': {
                deps: ['jquery', 'underscore'],
                exports: 'Backbone'
            },
            'fw': {
                deps: ['backbone', 'es-promise']
            }
        },
        paths: {
            'jquery': 'vendors/jquery/dist/jquery',
            'underscore': 'vendors/underscore/underscore',
            'backbone': 'vendors/backbone/backbone',
            'text': 'vendors/requirejs-text/text',
            'es6-promise': 'vendors/es6-promise/promise',
            'fw': 'fw',
            'templates': '../templates'
        },
    });

    require(['main'], function() {
        // console.log('main loaded');
    });

}());
