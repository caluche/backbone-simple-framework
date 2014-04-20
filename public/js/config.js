define([], function() {

    'use strict';

    return {
        useMultiRouting: true, // usefull for popins
        // multiRouteSeparator: '|' // optionnal - '|' is default
        // `paths` allow to map the filesystem with controller folders
        // could also be used to install plugins ?
        // suggest a default one
        paths: {
            // paths to app modules that needs to be loaded by the framework
            controllers: 'app/controllers'
        },
        states: {
            home: {
                route: '(home)',
                // controller is the name of the file where the controller object can be found,
                // allow to create an autoload system with require
                // example : 'path/to/controller::action'
                controller: 'controllers/main-controller::home',
                defaults: {}
            },
            content: {
                route: 'content(/:id)',
                controller: 'controllers/main-controller::content',
                defaults: { id: 25 }
            }
        },
        assets: {
            'img-1': {
                path: '/assets/img-1.jpg',
                cache: true, // defaults
                preload: true
            },
            /*
            'img-2': {
                path: '/assets/img-2.jpeg',
                cache: true, // defaults
                preload: false // defaults
            },
            */
            'reddit': {
                path: 'http://my.site.com/assets/reddit.json',
                cache: false,
                preload: false
            },


            'with-params': {
                path: '/assets/test-:id.json'
            },

            // 'with-range': {
            //     path: '/assets/range-:id.json',
            //     range: [100, 120]
            // }
            // for assets with variables in url, use predispatch event to map url to param
        },
        regions: {
            'header': '#header',
            'main': '#main',
            'footer': '#footer'
        },
        consts: {
            /* stored in require ? */
        }
    }
});
