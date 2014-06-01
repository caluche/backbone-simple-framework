define(
    [
        'underscore',
        'fw/views/base-view'
    ], function(_, BaseView) {

        'use strict';

        var ModelView = BaseView.extend({
            serializeData: function() {
                var data = BaseView.prototype.serializeData.apply(this);

                if (this.model) {
                    data = _.extend(data, this.model.toJSON());
                }

                return data;
            }
        });

        return ModelView;

    }
);
