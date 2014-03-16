(function() {

    //  define environment configuration
    //  parse url, etc...

    //  init requirejs with env config
    requirejs.config({
        // store here env variable that can be usefull for the framework
        globals: {
            // any env config that could be usefull into the app
            // stored in `requirejs.s.contexts._.config.globals`
            env: 'dev',
            debug: true,
            minify: false
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
            }
        },
        paths: {
            jquery: 'vendors/jquery/dist/jquery',
            underscore: 'vendors/underscore/underscore',
            backbone: 'vendors/backbone/backbone',
            text: 'vendors/requirejs-text/text',
            elipse: 'vendors/elipse'
        },
    });

    require(['main'], function() {
        // console.log('main loaded');
    });

}());
