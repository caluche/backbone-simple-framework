define([
        'backbone',
        'fw/components/region',
        'fw/views/base-view',
        'text!templates/home.tmpl'
    ], function(Backbone, Region, BaseView, homeTmpl) {

        'use strict';

        var SubView1 = BaseView.extend({
            template: '<h1 id="first-view">My First View</h1>',
        });

        var SubView2 = BaseView.extend({
            template: '<h1 id="second-view">My Second View</h1>',
        });

        var HomeView = BaseView.extend({
            id: 'home',

            events: {
                'click .view1, .view2': 'toggleContent',
            },

            template: homeTmpl,

            onRender: function() {
                this.region = new Region({
                    el: this.$('#test-region')
                });
            },

            toggleContent: function(e) {
                e.preventDefault();

                var classname = this.$(e.currentTarget).attr('class');
                var view = (classname == 'view1') ? new SubView1() : new SubView2();
                var transition = this.region.createTransition();
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
