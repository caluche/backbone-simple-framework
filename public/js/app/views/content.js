define(
    [
        'fw/views/model-view',
        'text!templates/content.tmpl'
    ], function(ModelView, contentTmpl) {

        'use strict';

        var ContentView = ModelView.extend({
            template: contentTmpl,

            initialize: function() {
                console.log('content initialized');
                this.listenTo(this.model, 'change', this.render);
            }
        });

        return ContentView;

    }
)
