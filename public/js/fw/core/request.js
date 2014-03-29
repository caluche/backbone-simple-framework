define(
    [
        'underscore'
    ], function(_) {

        'use strict';

        /**
         * Request
         *
         *  host and format informations about the request
         *  format Backbone's Router given information to create a named parameter
         *  object
         *  should be able to create an url from a state config and given params ?
         *
         *  should support at least namedParams, splatParams and optionnalParams
         *  (regexp support is not a priority)
         *
         *  @TODO should be constructed from `state` config and params
         */

        var optionalParam = /\((.*?)\)/g;
        var namedParam    = /(\(\?)?:\w+/g;
        var splatParam    = /\*\w+/g;

        var Request = function(pattern, params, defaults) {
            this.params = {};
            this.query = {};
            this.route = window.location.hash;

            this.mapRouteParameters(pattern, params);
        };

        _.extend(Request.prototype, {

            mapRouteParameters: function(pattern, params) {

                var extractedParameters = [];
                // find namedParams
                var res;
                while ((res = namedParam.exec(pattern)) != null) {
                    var param = {
                        name: res[0].slice(1),
                        index: res.index
                    };

                    extractedParameters.push(param);
                }

                // find splatParams
                var res;
                while ((res = splatParam.exec(pattern)) != null) {
                    var param = {
                        name: res[0].slice(1),
                        index: res.index
                    };

                    extractedParameters.push(param);
                }
                // define if optionnal

                // order by index
                extractedParameters = extractedParameters.sort(function(a, b) {
                    return a.index <= b.index ? -1 : 1;
                });

                // map with `params`
                for (var i = 0, l = extractedParameters.length; i < l; i++) {
                    this.params[extractedParameters[i].name] = params[i];
                }

                // merge with defaults
                console.log(extractedParameters);
                console.log(this.params);

                console.log('------------------------');

            },

            // parse window.location.query to map `query` attribute
            mapQueryParameters: function() {},

            // create a routing according to a pattern and given parameters
            getUrl: function(absolute) {
                // @param absolute default false
            },

        });

        return Request;
    }
);
