define(
    [
        'module',
        'config',
        'fw/fw',
        'fw/components/region',
        'fw/views/base-view'
    ], function(module, config, FW, Region, BaseView) {

        'use strict';

        var MyView1 = BaseView.extend({
            template: '<h1 id="first-view">My First View</h1>',
        });

        var MyView2 = BaseView.extend({
            template: '<h1 id="second-view">My Second View</h1>',
        });

        // lyout could have a region
        var MyRegion = Region.extend({
            defaultTransition: function(prevView, loaderView) {
                var that = this;

                prevView.$el.fadeTo(300, 0, function() {
                    // clean prevView
                    prevView.$el.remove();
                    prevView.close();
                    // =>   show loaderView
                });

                // is executed from the loadingDeferred
                that.next(function(newView) {
                    newView.render(); // `onRender` is called when fragment ready
                    newView.hide();
                    // =>   hide loaderView
                    that.$el.append(newView);
                    // tells the app this region is ready: unlock the ui
                    that.resume();
                    newView.fadeIn(300);
                });
            },

            states: ['hide', 'pending', 'show'],
            state: undefined,
            counter: 0,

            resume: function(callback) {
                this.counter += 1;
                this.state = this.states[this.counter];
                console.log(this.state);
            }
            /*
            show: function(newView) {
                // render the next view
                nextView.render(); // calls the `onRender` method when html fragment is ready
                nextView.$el.hide();
                this.$el.append(nextView.$el);
                // show
                nextView.$el.fadeIn();
                this.resume();
            },

            hide: function(prevView) {
                prevView.$el.fadeTo(300, 0, function() {
                    // clean prevView
                    prevView.$el.remove();
                    prevView.close();

                    this.resume();
                });
            }
            */
        });

        var doStuff = function() {
            var region = new MyRegion({
                el: '#test-region'
            });

            $('.view1, .view2').on('click', function(e) {
                e.preventDefault();
                var className = $(this).attr('class');

                var view = (className == 'view1') ? new MyView1() : new MyView2();

                region.makeTransition(view, 'defaultTransition');
            })
        }

        //  get env config from requirejs
        var env = module.config();
        // ---------------------------------------------
        // wait for the DOM
        $('document').ready(function() {
            // intialize the framework
            FW.initialize(config, env);
            // call these directly or through config extend
            // FW.setLayout(MyAppLayout);
            // FW.setAppController(MyAppController);

            // install plugins
            // FW.install('analytics', MyPluginCtor);

            /**
             *  // example:
             *  var TestPlugin = function(options) {
             *      this.name = 'plugin-test';
             *
             *      options._com.subscribe('router:change', function() {
             *          console.log('   ->  from plugin', arguments, this)
             *      }, this);
             *  }
             *
             *  // install
             *  FW.install('test-plugin', TestPlugin);
             */

            // start the whole stuff
            Backbone.history.start();

            doStuff();
        });
    }
);
