define([], function() {

    'use strict';

    return {
        useMultiRouting: true, // usefull for popins
        // multiRouteSeparator: '|' // optionnal - '|' is default
        // `paths` allow to map the filesystem with controller folders
        // could also be used to install plugins
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
                controller: 'controller::home',
                defaults: {}
            },
            a: {
                route: 'a/:test',
                // this controller tries to work
                controller: 'controller::index',
                defaults: {}
            },
            b: {
                route: 'b/:niap',
                controller: 'controller::content',
                defaults: {}
            },
            shouldNotBeCalled: {
                route: 'a/:test|b/:niap',
                controller: 'controller::action',
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
