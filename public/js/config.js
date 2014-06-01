define([], function() {

    'use strict';

    return {
        useMultiRouting: true, // usefull for popins
        // multiRouteSeparator: '|' // optionnal - '|' is default
        // `paths` allow to map the filesystem with controller folders
        // could also be used to install plugins ?
        // suggest a default one
        states: {
            home: {
                route: '(home)',
                // controller is the name of the file where the controller object can be found,
                // allow to create an autoload system with require
                // example : 'path/to/controller::action'
                controller: 'main-controller::home',
                defaults: {}
            },
            content: {
                route: 'content(/:id)',
                controller: 'main-controller::content',
                defaults: { id: 25 }
            }
        },
        assets: {
            'img-1': {
                path: '/assets/img-1.jpg',
                cache: true, // defaults
                preload: true
            },
            'img-2': {
                path: '/assets/img-2.jpg',
                cache: true, // defaults
                preload: false // defaults
            },
            'reddit': {
                path: '/assets/reddit.json',
                cache: false,
                preload: false
            },
            'with-params': {
                path: '/dynamic-assets/:id',
                cache: false,
                // @TODO test defaults
            }
        },
        regions: {
            'header': '#header',
            'main': '#main',
            'footer': '#footer'
        },
        shared: {
            url: 'http://www.google.com'
        }
    }
});
