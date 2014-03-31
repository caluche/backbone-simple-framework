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

        /**
         *  Transition
         *
         *  allow to simply manage transitions between 2 views in a region
         *  single use object (maybe think Object Pool for these)
         *  very coupled with Region object
         */
        function Transition(region, prevView) {
            this.region = region;
            this.$el = region.$el;
            this.prevView = prevView;

            // create promises
            this.hidePromise = this.createHidePromise();
            this.showPromise = this.createShowPromise();
            // state machine with two states ['hide', 'show']
            this.state = 'hide',
            // the `doShow` method should be called
            // only when the `hideDeferred` and `showDeferred`
            // are resolved
            // show promise must be the first one to keep correct param order
            $.when(this.showPromise, this.hidePromise)
             .done(_.bind(this.doShow, this));
        }

        Transition.extend = Backbone.View.extend;

        // the chain is :
        //     hideDeferred -> then -> showDeferred
        // need 2 parallel promises

        _.extend(Transition.prototype, {
            // `hidePromise` whould be resolved
            // when `this.resume` is called
            // the first time
            createHidePromise: function() {
                this.hideDeferred = new $.Deferred();
                return this.hideDeferred.promise();
            },

            // `showPromise` should be resolved
            // when show is called
            // - its value is the nextView object
            // (we can assume this.method is called when assets are loaded)
            createShowPromise: function() {
                this.showDeferred = new $.Deferred();
                return this.showDeferred.promise();
            },

            resume: function() {
                console.log('state:', this.state);
                switch (this.state) {
                    // if called when state is hide
                    case 'hide' :
                        this.state = 'show';
                        this.hideDeferred.resolve();
                        break;
                    case 'show' :
                        console.log('   => unlock ui');
                        break;
                }
            },

            hide: function() {
                console.log('   => lock ui');
                if (!this.prevView) {
                    // resume now
                    this.resume();
                    return;
                }
                this.doHide(this.prevView);
            },

            // this call resolve the showPromise with `nextView`
            show: function(nextView) {
                this.showDeferred.resolve(nextView);
            },

            // @TODO maybe rename
            // methods to override
            // receive `this.prevView` as argument for API consistency
            doHide: function(prevView) {
                prevView.$el.fadeTo(300, 0, _.bind(function() {
                    prevView.$el.remove();
                    prevView.close();

                    this.resume();
                }, this));
            },

            doShow: function(nextView) {
                nextView.render();
                nextView.$el.hide();
                nextView.$el.appendTo(this.$el);

                nextView.$el.fadeTo(300, 1, _.bind(function() {
                    this.resume();
                }, this));
            }
        });

        var doStuff = function() {
            // prepare
            var container = $('#test-region');
            var currentView = undefined;

            $('.view1, .view2').on('click', function(e) {
                e.preventDefault();

                var classname = $(this).attr('class');
                var view = (classname == 'view1') ? new MyView1() : new MyView2();

                // is single use
                var transition = new Transition({
                    $el: container
                }, currentView);

                transition.hide();
                transition.show(view);

                /*
                // mimic loading time
                setTimeout(function() {
                    transition.show(view);
                }, 3000);
                // */

                currentView = view;
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
