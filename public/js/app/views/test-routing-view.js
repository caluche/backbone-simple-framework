define([
        'fw/views/base-view',
        'text!templates/test-routing.tmpl'
    ], function(BaseView, tmpl) {

        'use strict';

        var TestRoutingView = BaseView.extend({
            template: tmpl
        });

        return TestRoutingView;
    }
);
