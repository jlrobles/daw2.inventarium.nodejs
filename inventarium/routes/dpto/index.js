


//<editor-fold defaultstate="collapsed" desc="var">

var
        express = require('express')
        , router = express.Router()
        , app = express()
        , actionHome = "./dpto"
        , tblName = "dpto"
        ;

//</editor-fold>      variables del módulo
//--------
//<editor-fold defaultstate="collapsed" desc="utils">


function sout(v) {
    return JSON.stringify(v, censor(v));
}

function censor(censor) {
    var i = 0;

    return function (key, value) {
        if (i !== 0 && typeof (censor) === 'object' && typeof (value) === 'object' && censor === value)
            return '[Circular]';

        if (i >= 29) // seems to be a harded maximum of 30 serialized objects?
            return '[Unknown]';

        ++i; // so we know we aren't using the original object anymore

        return value;
    };
}
//</editor-fold>    utilidades (sout, censor)
//--------
//<editor-fold defaultstate="collapsed" desc="showForm">
function showForm(req, res, next, msg, item) {
    item = item ? item : {}; // inicializar valor.
    console.log("{showForm} msg:" + sout(msg) + ", item: " + sout(item));
    res.render(__dirname + '/c',
            {'msg': msg,
                'tblName': tblName,
                'item': item
            });
}

//</editor-fold> show list of tblName
//<editor-fold defaultstate="collapsed" desc="showRows">
function showRows(req, res, next, msg) {
    var db = req.db;
    //res.send(db);
    var tbl = db.get(tblName);
    //users.find({}, {sort: {name: 1}}, function () {});// sorted by name field
    tbl.find({}, {sort: {des: 1}}, function (e, items) {
        res.render(__dirname + '/rr', {
            'tblName': tblName
            , 'items': items
            , 'msg': msg
        });
    });
}
;

//</editor-fold> show list of tblName
//<editor-fold defaultstate="collapsed" desc="/">
router.get('/', function (req, res, next) {
    showRows(req, res, next, {});
});
//</editor-fold>        home page
//<editor-fold defaultstate="collapsed" desc="dd">

router.get("/dd", function (req, res, next) {
    var db = req.db;
    var tbl = db.get(tblName);
    tbl.drop(function (err) {
        if (err)
            throw err;
        showRows(req, res, next, {'class': "success", 'msg': "Taula esborrada"});
    });

});
//</editor-fold>       drop table
//--------
//<editor-fold defaultstate="collapsed" desc="c">
router.get("/c", function (req, res, next) {
    showForm(req, res, next);
});

router.post("/c", function (req, res, next) {
    var
            db = req.db // Set our internal DB variable
            , _id = req.body._id
            , des = req.body.des
            , tbl = db.get(tblName)
            ;
    console.log("{post_c} buscar _id:" + _id);
    tbl.findOne({'_id': _id}).on('success', function (doc) {
        console.log("{post_c} buscado, doc: " + sout(doc));
        var msg = {'class': "success", 'msg': "s'ha afexit"};
        if (doc) {
            console.log("{post_c} _id:" + _id + " existe. doc:" + sout(doc));
            msg.class = "danger";
            msg.msg = "Ja existeix aqueta clau, amb la descripciò: " +
                    doc.des + ", modifiqui o afageixi un altre.";
        } else {
            console.log("{post_c} _id:" + _id + " inexistente");
            tbl.insert({"id": _id, "des": des}, function (err, doc) {
                if (err) {
                    msg.class = "danger";
                    msg.msg = "S'ha trobat un problema afegin a la base de dades.";
                    console.log("{post_c} _id:" + _id + ", insert error:" + err);
                }
                console.log("{post_c} _id:" + _id + " insert OK, doc:" + sout(doc));
            });
        }
        showForm(req, res, next, msg); //res.render(__dirname + '/c', {'msg': msg, 'tblName': tblName});
    });
});
//</editor-fold>        create
//<editor-fold defaultstate="collapsed" desc="r">

//</editor-fold>        read (No implementado)
//<editor-fold defaultstate="collapsed" desc="u">
router.get("/u/:_id", function (req, res, next) {
    var
            db = req.db // Set our internal DB variable
            , _id = req.params._id
            , tbl = db.get(tblName)
            ;
    console.log("{get_u} buscar _id:" + _id);
    tbl.findOne({'_id': _id}).on('success', function (doc) {
        if (doc) {
            console.log("{get_u} _id:" + _id + ", encontrado, doc: " + sout(doc));
            showForm(req, res, next, null, doc);
        } else {
            console.log("{get_u} _id:" + _id + ", inexistente");
            showRows(req, res, next, {'class': "danger", 'msg': "No s'ha trobat al codi indicat ('" + _id + "')"});
        }
    });
});
router.post("/u/:_id?", function (req, res, next) {
    // El parametro _id: Lo mantenemos para la firma (ya que el form envía lo mismo)
    //  pero hacemos caso omiso.
    var
            db = req.db // Set our internal DB variable
            , _idOld = req.body._idOld //req.params._id ? req.params._id : req.body._idOld
            , _id = req.body._id
            , des = req.body.des
            , tbl = db.get(tblName)
            , ret = ""
            , item = req.body // mostraremos los datos recogidos.
            , msg = {'class': "success", 'msg': "s'ha actualitzat correctament."}
    ;
    console.log("{post_u} _id(actual):" + _idOld + "id (nuevo):" + _id);
    // ¿Quiere cambiar de _id?
    if (_id !== _idOld) {
        console.log("{post_u} cambiar _id.");
        tbl.findOne({'_id': _id}).on('success', function (doc) {
            if (doc) {
                console.log("{post_u} _id(nuevo):" + _id + ", existe (problema), doc: " + sout(doc));
                msg.class = "danger";
                msg.msg = "Ja existeix la nova clau, amb la descripciò: " +
                        doc.des + ", ha d'indicar un altre codi per camviar.";
                showForm(req, res, next, msg, item);
            } else {
                console.log("{post_u} _id(nuevo):" + _id + ", inexiste");
                tbl.update({'_id': _idOld}, {'_id': _id, 'des': des}, function (err, doc) {
                    if (err) {
                        console.log("{post_u} error al actualizar. doc:" + sout(item));
                        msg.class = "danger";
                        msg.msg = "S'ha trobat un problema actualitzant la fitxa.";
                    } else {
                        console.log("{post_u} actualización realizada");
                        item._idOld = item._id; // cambiamos el _id, por si quieren volver a actualizar.
                    }
                    showForm(req, res, next, msg, item);
                });
            }
        });
    } else {
        console.log("{post_u} cambiar des.");
        // update: los datos no indicados se quedarán a NULL
        tbl.update({'_id': _idOld}, {'_id': _id, 'des': des}, function (err, doc) {
            if (err) {
                console.log("{post_u} error al actualizar. doc:" + sout(item));
                msg.class = "danger";
                msg.msg = "S'ha trobat un problema actualitzant la fitxa.";
            } else {
                console.log("{post_u} actualización realizada");
            }
            showForm(req, res, next, msg, item);
        });

    }
});

//</editor-fold>        update
//<editor-fold defaultstate="collapsed" desc="d">

router.get("/d/:_id", function (req, res, next) {
    var db = req.db;
    var tbl = db.get(tblName);
    var _id = req.params._id;
    tbl.remove({'_id': _id}, function (err) {
        if (err)
            throw err;
    });
    showRows(req, res, next, {'class': "success", 'msg': "s'ha eliminat"});
});
//</editor-fold>        delete
//--------
module.exports = router;
//--------
//<editor-fold defaultstate="collapsed" desc="v1">

//
// *  index.js
// *      Replace '.id' --> '._id'
// *      Replace '(id' --> '(_id'
// *      Replace ' id' --> ' _id'
// *      Replace ':id' --> ':_id'
// *      Buscar {id -->> {'_id'
// *      Nota: Ya no tiene sentido el campo _id, editable. Ahora será hidden
// *  c.jade
// *  rr.jade
//

//</editor-fold> cambio id x _id