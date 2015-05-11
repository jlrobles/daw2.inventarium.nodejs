var
        express = require('express')
        , router = express.Router()
        , app = express()
;
//<editor-fold defaultstate="collapsed" desc="pruebas">

//app.set('views',__dirname);
//app.set('view engine', 'jade');

//</editor-fold>
/* GET users listing. */
router.get('/', function (req, res, next) {
    var db = req.db;
    //res.send(db);
    var collection = db.get('usercollection');
    collection.find({},{},function(e,docs){
        res.render(__dirname + '/rr', {
            "userlist" : docs
        });
    });
    // res.send('respond with a resource jeje');
});

router.get("/c", function (req, res, next) {
    res.render(__dirname + '/c', {
        action: "./users",
        error: {}
//        ,env: app.get('env')
    });
    //res.send( "<br>id: " + req.params.id);
});
router.post("/c", function (req, res, next) {
    res.send(req.body);
//    res.render(__dirname+'/c', {
//        action: "./users",
//        error: {}
////        ,env: app.get('env')
//    });

});

router.get("/:id", function (req, res, next) {
    res.send("<br>id: " + req.params.id);
});


module.exports = router;
