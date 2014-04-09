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
            index: {
                route: '(home)',
                // controller is the name of the file where the controller object can be found,
                // allow to create an autoload system with require
                // example : 'path/to/controller::action'
                controller: 'controllers/mainController::home',
                defaults: {}
            },

            content: {
                route: 'content(/:id)',
                controller: 'controllers/mainController::content',
                defaults: { id: 25 }
            }
            /*
            routeA: {
                route: 'route-a/:id(/*slug)',
                // this controller tries to work
                controller: 'controllers/mainController::routeA',
                defaults: {
                    'slug': 'default-value'
                }
            },
            routeB: {
                route: 'route-b/:id',
                controller: 'controllers/mainController::routeB',
                defaults: {}
            },
            shouldNotBeCalled: {
                route: 'a/:test|b/:niap',
                controller: 'controllers/mainController::action',
                defaults: {}
            }
            */
        },
        assets: {
            globals: [],
            statics: {
                /* state: { id: url } ? */
            },
            dynamics: {
                //
            }
        },
        regions: {
            'header': '#header',
            'main': '#main',
            'footer': '#footer'
        },

        views: {/* ? */},
        constantes: {
            /* stored in require ? */
        }
    }
});
