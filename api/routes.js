'use strict';
module.exports = function(app) {
    var taskInvoice = require('./controller/invoice');

    // app.route('/cwmsgov/:code')
    //     .get(cwmsgovList.readItem)
    //     .put(cwmsgovList.updateItem);

    // app.route('/cwms/:positionId')
    //     .get(todoList.get_cwms_by_id);

    app.route('/invoice')
        .get(taskInvoice.list_invoice);
    
    app.route('/invoice/:countId')
        .get(taskInvoice.get_invoice);

};