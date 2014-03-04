(function() {

    requirejs.config({
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
            elipse: {
                deps: ['backbone'],
                exports: 'Elipse'
            }
        },
        paths: {
            jquery: 'vendors/jquery/dist/jquery',
            underscore: 'vendors/underscore/underscore',
            backbone: 'vendors/backbone/backbone',
            text: 'vendors/requirejs-text/text',
            elipse: 'vendors/elipse'
        }
    });

    require(['main'], function() {
        // console.log('main loaded');
    });

}());
