define(
    [
        'underscore'
    ], function(_) {

        'use strict';

        /**
         *  REQUEST
         *
         *  host and format informations about the request
         *  format Backbone's Router given information to create a named parameter
         *  object
         *  should be able to create a request and its url from parameters
         *
         *  should support at least namedParams, splatParams and optionnalParams
         *  (regexp support is not a priority)
         */
        var optionalParam = /\((.*?)\)/g;
        var namedParam    = /(\(\?)?:\w+/g;
        var splatParam    = /\*\w+/g;

        var Request = function(state, params, counter) {
            // params can be Array or Object
            // `mapRouteParameters` should be called only if Array
            this.originalParams = params;
            this.state = state;
            this.controllers = counter;

            this.params = {};
            this.query = {};

            this.hash = window.location.hash;

            this.mapRouteParameters();
            this.mapQueryParameters();
        };

        _.extend(Request.prototype, {

            /**
             *  create a named param object from route and Backbone's params
             */
            mapRouteParameters: function() {

                var extractedParameters = [];

                _.each([namedParam, splatParam], function(regexp, index) {
                    var res;

                    while ((res = regexp.exec(this.state.route)) != null) {
                        var param = {
                            name: res[0].slice(1),
                            index: res.index
                        };

                        extractedParameters.push(param);
                    }
                }, this);

                // order by index
                extractedParameters = extractedParameters.sort(function(a, b) {
                    return a.index <= b.index ? -1 : 1;
                });

                // map with `params`
                _.each(extractedParameters, function(param, index) {
                    this.params[param.name] = this.originalParams[index];
                }, this);

                // merge with defaults
                var defaults = this.state.defaults;
                for (var prop in defaults) {
                    if (!this.params[prop]) {
                        this.params[prop] = defaults[prop];
                    }
                }
            },

            // parse window.location.query to map `query` attribute
            mapQueryParameters: function() {
                var query = window.location.search.slice(1);
                var pairs = query.split('&');

                _.each(pairs, function(pair) {
                    pair = pair.split('=');
                    this.query[pair[0]] = pair[1];
                }, this);
            },

            // create a route according to a state and given parameters
            getUrl: function(params, absolute) {
                // @param absolute default false
            },

        });

        return Request;
    }
);
