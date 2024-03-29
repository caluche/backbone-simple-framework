define(
    [
        'backbone'
    ],
    function(Backbone) {

        'use strict';

        /**
         *  @API - entry points
         *      template      <string>      template used in the view - set it in object declaration or `initialize` method to use precahed templating
         *      serializeData <function>    if defined, returns the data to be used in the template
         *      onRender      <function>    if defined, is executed at the end of the render method (before the element is in the DOM)
         *      onShow        <function>    if defined, can be called manually to add DOM Dependant logic (initialize a plugin, animate the show, etc...)
         *
         *  @API - methods
         *      render              <function>  create this $el from template and serializedData - @return this.$el
         *      buildTemplateCache  <function>  cache this precompiled template for all the instances
         *
         *  @TODO
         *      - find a way to have a `beforeRemove` (alias `hide`|`close` ?) method to handle the way the view disappear
         *          => should be able to work asynchroneously to handle hide animations
         *      trigger events on each rendering/hiding steps to allow other objects to monitor the view
         *      - need to implement a `close` method
         */
        var BaseView = Backbone.View.extend({

            // override Backbone's constructor method to get precompiled cache
            constructor: function() {
                this.buildTemplateCache();
                this.sharedData = (BaseView._shared || {});
                Backbone.View.prototype.constructor.apply(this, arguments);
            },

            serializeData: function() {
                var data = {};
                data._shared = this.sharedData;

                return data;
            },

            //  if Object.getPrototypeOf is available (IE9+)
            //  cache the precompiled template in prototype
            //  else rebuild it => no need for add a shim for IE8 only
            buildTemplateCache: function() {
                if (!this.template) { return; }
                //  if we can access the prototype, get it, else just get current instance (no cache in this case)
                var host = ('getPrototypeOf' in Object) ? Object.getPrototypeOf(this) : this;
                // return if already precompiled
                if (host.cachedTemplate) { return; }

                // assume we use underscore's template engine,
                // add some config to change that if needed
                host.cachedTemplate = BaseView.templateEngine(this.template);
            },

            render: function() {
                var data;
                // call method `serializeData` if exists
                if (_.isFunction(this.serializeData)) {
                    data = this.serializeData();
                }

                // render template if any
                if (this.cachedTemplate) {
                    var renderedHtml = this.cachedTemplate(data);
                    this.$el.html(renderedHtml);
                }

                // call method `onRender` if exists
                if (_.isFunction(this.onRender)) {
                    this.onRender();
                }

                // return `this` to allow use in parent view (Backbone's convention)
                return this;
            },

            close: function() {
                this.remove();
            }

        });

        // default template engine
        BaseView.templateEngine = _.template;

        // static method to set helpers and template engine
        BaseView.configure = function(options) {
            // replace default template engine
            if (options.engine) {
                BaseView._engine = options.engine;
            }

            //
            if (options.shared) {
                BaseView._shared = options.shared
            }
        }

        return BaseView;
    }
);
