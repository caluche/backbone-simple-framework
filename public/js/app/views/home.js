define([
        'backbone',
        'fw/components/region',
        'fw/views/base-view',
        'fw/views/model-view',
        'text!templates/home.tmpl'
    ], function(Backbone, Region, BaseView, ModelView, homeTmpl) {

        'use strict';

        var SubView1 = BaseView.extend({
            template: '<h1 id="first-view">My First View</h1>',
        });

        var SubView2 = BaseView.extend({
            template: '<h1 id="second-view">My Second View</h1>',
        });

        var HomeView = ModelView.extend({
            id: 'home',

            events: {
                'click .view1, .view2': 'toggleContent',
            },

            template: homeTmpl,

            onRender: function() {
                this.innerRegion = new Region({ el: this.$('#test-region') });
            },

            onShow: function() {
                this.toggleContent();
            },

            toggleContent: function(e) {
                var classname;

                if (e) {
                    e.preventDefault();
                    classname = this.$(e.currentTarget).attr('class');
                } else {
                    classname = 'view1';
                }

                var view = (classname == 'view2') ? new SubView2() : new SubView1();
                var transition = this.innerRegion.createTransition();
                transition.hide();

                // mimic loading time
                setTimeout(function() {
                    transition.show(view);
                }, 300);
            }
        });

        return HomeView;

    }
);
