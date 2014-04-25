define(
    [
        'fw/views/base-view'
    ], function(BaseView) {

        'use strict';

        var ModelView = BaseView.extend({
            serializeData: function() {
                var data;

                if (this.model) {
                    data = this.model.toJSON()
                }

                return data;
            }
        });

        return ModelView;

    }
);