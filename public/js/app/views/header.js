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

            // overriden methods
            onRender: function() {
                this.$nav = this.$('.nav li');
                this.$contentLink = this.$nav.filter('[data-state="content"]').children('a');

                this.randomizeContent();
            },

            // is triggered when $el is inserted in the DOM
            onShow: function() {
                this.updateNav();
            },

            // user methods
            updateNav: function(model, state) {
                this.$nav.removeClass('active');
                this.$nav.filter('[data-state="' + this.model.get('state') + '"]').addClass('active');
            },

            randomizeContent: function() {
                var href = '#content/' + parseInt(Math.random() * 100, 10);
                this.$contentLink.attr('href', href);
            },

            updateBgColor: function() {
                this.$('.navbar-inner').css({ borderColor: this.getRandomColor() });
            },

            // http://stackoverflow.com/questions/1484506/random-color-generator-in-javascript
            getRandomColor: function() {
                var letters = '0123456789abcdef'.split('');
                var color = '#';
                for (var i = 0; i < 6; i++ ) {
                    color += letters[Math.round(Math.random() * 15)];
                }
                return color;
            }
        });

        return HeaderView;
    }
);
