define(
    [
        'fw/views/base-view',
        'text!templates/common/header.tmpl'
    ], function(BaseView, tmpl) {

        'use strict';

        var HeaderView = BaseView.extend({
            template: tmpl,

            initialize: function() {
                this.listenTo(this.model, 'change:state', this.updateNav);
            },

            onRender: function() {
                this.$nav = this.$('.nav li');
                this.$contentLink = this.$nav.filter('[data-state="content"]').children('a');

                this.randomizeContent();
            },

            // is triggered when $el is inserted in the DOM
            onShow: function() {
                // console.log('header on show');
            },

            updateNav: function(model, state) {
                this.$nav.removeClass('active');
                this.$nav.filter('[data-state="' + state + '"]').addClass('active');
            },

            randomizeContent: function() {
                var href = '#content/' + parseInt(Math.random() * 100, 10);
                this.$contentLink.attr('href', href);
            }
        });

        return HeaderView;
    }
);