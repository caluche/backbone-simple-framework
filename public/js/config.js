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
                // controller is the name of the file where the controller object can be found
                // allow to create an autoload system with require
                // example : 'path/to/controller::action'
                controller: 'controllers/myController::home',
                defaults: {}
            },
            routeA: {
                route: 'route-a/:id(/*slug)',
                // this controller tries to work
                controller: 'controllers/myController::routeA',
                defaults: {
                    'slug': 'default-value'
                }
            },
            routeB: {
                route: 'route-b/:id',
                controller: 'controllers/myController::routeB',
                defaults: {}
            },
            shouldNotBeCalled: {
                route: 'a/:test|b/:niap',
                controller: 'controllers/myController::action',
                defaults: {}
            }
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
        views: {/* ? */},
        constantes: {
            /* stored in require ? */
        }
    }
});
