
function printOrder(order) {
    var builder = new epson.ePOSBuilder();

    function _logo() {
        var canvas = $('#logo-canvas').get(0);
        var context = canvas.getContext('2d');
        context.drawImage($('#logo').get(0), 0, 0, logoSize.width, logoSize.heigth);
        builder.addTextAlign(builder.ALIGN_CENTER);
        builder.addImage(context, 0, 0, logoSize.width, logoSize.heigth);
        builder.addFeedUnit(20);
    }

    function _orderId(order) {
        builder.addTextAlign(builder.ALIGN_LEFT);
        builder.addTextDouble(true, true).addText('Ordine N° ');
        builder.addTextDouble(true, true).addText(order.orderId);
        builder.addText('\n');
        builder.addFeedUnit(10);
    }

    function _itemCategory(item) {
        builder.addTextAlign(builder.ALIGN_LEFT);
        builder.addFeedUnit(20);
        builder.addTextDouble(false, false).addText('\u2022 ');
        builder.addTextDouble(true, false).addText(item.category);
        builder.addText('\n');
        builder.addFeedUnit(20);
    }

    function _orderCustomerInfo(order) {
        if (order.customer === null) {
            return;
        }
        builder.addTextAlign(builder.ALIGN_LEFT);
        builder.addTextStyle(false, false, false);
        builder.addTextDouble(true, false).addText('Cliente: ');
        builder.addTextDouble(true, false).addText(order.customer.name);
        builder.addTextDouble(false, false).addText('\n');
        builder.addTextDouble(false, false).addText(order.customer.address);
        builder.addTextDouble(false, false).addText('\n');
        builder.addTextDouble(false, false).addText(order.customer.zip_code + ' - ' + order.customer.city);
        builder.addText('\n');
        builder.addFeedUnit(20);
    }

    function _orderSupplierInfo(order) {
        if (order.sale_point === null) {
            return;
        }
        builder.addTextStyle(false, false, false);
        builder.addTextAlign(builder.ALIGN_LEFT);
        builder.addTextDouble(true, false).addText('Fornitore: ');
        builder.addTextDouble(true, false).addText(order.sale_point.name);
        builder.addText('\n');
        builder.addTextDouble(false, false).addText(order.sale_point.address);
        builder.addText('\n');
        builder.addTextDouble(false, false).addText(order.sale_point.zip_code + ' - ' + order.sale_point.city);
        builder.addText('\n');
        builder.addTextDouble(false, false).addText('P.IVA: ');
        builder.addTextDouble(false, false).addText(order.sale_point.piva);
        builder.addText('\n');
        builder.addFeedUnit(20);
    }

    function _orderPreparationTime(order) {
        var date = new dayjs(order.preparation_time);

        builder.addTextStyle(false, false, true);
        builder.addTextSize(1, 1);
        builder.addText('Preparazione: ');
        builder.addText(date.format('DD MMMM YYYY - HH:mm:ss'));
        builder.addText('\n');
        builder.addFeedUnit(20);
    }

    function _orderNote(order) {
        builder.addTextStyle(false, true, false);
        builder.addTextSize(1, 1);
        builder.addText(order.note);
        builder.addText( '\n');
        builder.addTextStyle(false, false, false);
        builder.addFeedUnit(20);
    }

    function _addLine() {
        var canvas = $('#line-canvas').get(0);
        var context = canvas.getContext('2d');
        context.drawImage($('#solid-line').get(0), 0, 0, lineSize.width, lineSize.heigth);

        builder.addTextAlign(builder.ALIGN_CENTER);
        builder.addImage(context, 0, 0, lineSize.width, lineSize.heigth);
        builder.addFeedUnit(20);
    }

    function _orderTotalCosts(order) {
        builder.addTextAlign(builder.ALIGN_RIGHT);
        builder.addTextDouble(true, false).addText('Totale: ');
        builder.addText(order.total_costs);
        builder.addText('\n');
        builder.addFeedUnit(20);
    }

    function _addNow() {
        var now = new dayjs();
        builder.addTextAlign(builder.ALIGN_RIGHT);
        builder.addTextStyle(true, false, false);
        builder.addTextSize(1, 1);
        builder.addText(now.format(' DD MMMM YYYY - HH:mm:ss '));
        builder.addText('\n');
        builder.addFeedUnit(20);
    }

    function _orderItems(order) {
        builder.addTextAlign(builder.ALIGN_LEFT);

        var itemCategory;
        order.items.forEach(function (item, index) {
            if (itemCategory !== item.category) {
                _itemCategory(item);
                itemCategory = item.category;
            }
            builder.addTextDouble(false, true).addText('  ');
            builder.addTextDouble(false, true).addText(item.quantity);
            builder.addTextDouble(false, true).addText(' - ');
            builder.addTextDouble(false, true).addText(item.name);
            builder.addTextDouble(false, true).addText('\n');

            if (item.note !== null) {
                builder.addFeedUnit(5);
                builder.addTextSize(1, 1);
                builder.addTextDouble(false, false).addText('  ');
                builder.addText('Note: ');
                builder.addText(item.note);
                builder.addText('\n');
            }

            builder.addFeedUnit(20);
        });
    }

    function _orderItemsCosts(order) {

        var itemCategory;
        order.items.forEach(function (item, index) {
            builder.addTextAlign(builder.ALIGN_LEFT);

            if (itemCategory !== item.category) {
                _itemCategory(item);
                itemCategory = item.category;
            }
            builder.addTextDouble(false, true).addText('  ');
            builder.addTextDouble(false, true).addText(item.quantity);
            builder.addTextDouble(false, true).addText(' - ');
            builder.addTextDouble(false, true).addText(item.name);

            builder.addText('\n');
            builder.addFeedUnit(5);
            builder.addTextAlign(builder.ALIGN_RIGHT);
            builder.addTextDouble(true, false).addText(item.price);
            builder.addText('\n');

            builder.addFeedUnit(20);
        });
        builder.addTextAlign(builder.ALIGN_LEFT);
    }

    (function ticketBuilder(builder, order) {
        builder.addTextLang('it').addTextSmooth(true);

        var sortItems = Object.assign({}, order.items.sort(function (a, b) {
            return ((a['category'] < b['category']) ? -1 :((a['category'] > b['category']) ? 1 :0));
        }));

        order.items = [];

        for (var i in sortItems) {
            order.items.push(sortItems[i]);
        }

        _logo();
        _addLine();
        _orderId(order);
        _orderPreparationTime(order);
        _orderNote(order);
        _addLine();
        _orderCustomerInfo(order);
        _addLine();
        _orderSupplierInfo(order);
        _addLine();
        _orderItems(order);
        _addLine();
        _orderItemsCosts(order);
        _addLine();
        _orderTotalCosts(order);
        _addLine();
        _addNow();

        builder.addCut();

        print(builder);
    })(builder, order);

    function print(builder) {
        var url = 'https://' + ipaddr + '/cgi-bin/epos/service.cgi?devid=' + devid + '&timeout=' + timeout;
        var epos = new epson.ePOSPrint(url);

        epos.send(builder.toString());

        epos.onreceive = function (res) {
            if (res.success) {
                console.log(res);
            }
        };

        epos.onerror = function (err) {
            console.log(err);
        };
    }

}