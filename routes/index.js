
/*
 * GET home page.
 */

exports.index = function(req, res) {
    res.render('index', { title: 'Express' });
};

exports.dynamicAsset = function(req, res) {
    var document = { asset: req.params.id };
    var timeout = parseInt(Math.random() * 3000, 10);
    // mimic async behavior and heavy file
    setTimeout(function() {
        res.send(200, document);
    }, timeout);
}
