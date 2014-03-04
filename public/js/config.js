define([], function() {

    'use strict';

    return {
        states: {
            index: {
                route: '(home)',
                controller: 'controller::action',
                defaults: []
            },
            a: {
                route: 'a/:test',
                controller: 'controller::action',
                defaults: []
            },
            b: {
                route: 'b/:niap',
                controller: 'controller::action',
                defaults: [],
            },
            shouldNotAppend: {
                route: 'a/:test|b/:niap',
                controller: 'controller::action',
                defaults: [],
            }
        },
        assets: {
            globals: [],
            static: {},
            dynamic: {}
        }
        views: {/* ? */},
        constantes: {
            /* soted in require ? */
        }
    }
});
