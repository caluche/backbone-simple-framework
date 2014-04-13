define(
    [
        'fw/views/model-view',
        'text!templates/content.tmpl'
    ], function(ModelView, contentTmpl) {

        'use strict';

        var ContentView = ModelView.extend({
            template: contentTmpl,

            initialize: function() {
                this.listenTo(this.model, 'change', this.updateView);
            },

            updateView: function(model, value) {
                console.log(this.model.toJSON());
                this.render();
            }
        });

        return ContentView;

    }
)
