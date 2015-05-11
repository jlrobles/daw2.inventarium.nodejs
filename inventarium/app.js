var
        express = require('express')
        , path = require('path')
        , favicon = require('serve-favicon')
        , logger = require('morgan')
        , cookieParser = require('cookie-parser')
        , bodyParser = require('body-parser')
        , mongo = require('mongodb')
        , monk = require('monk')
        , db = monk('localhost:27017/inventarium')
        //, dbClient = require('mongodb').MongoClient;

        ;

var
        routes = require('./routes/index')
        , users = require('./routes/users/index')
        , dpto = require('./routes/dpto/index')
        ;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


process.env.PORT = '3001'; // ./bin/www // Default :3000
app.set('env',(!true)?'production':'development');
//if (true)
//    app.set('env', 'development');
//else
//    app.set('env', 'production');


// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router (antes de los ROUTES)
app.use(function(req,res,next){
//console.log ("asignar db");
    //req.dbClient = dbClient;
    req.db = db;
    next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/dpto', dpto);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
// 
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            env: app.get('env')
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
//        ,env: app.get('env')
    });
});


//console.log('Express server listening on port: ' + app.get('port')); -->> "undefined"
//
//
//
//
////app.set('env','last');
//console.log('Express server environment: ' + app.get('env'));
//console.log('Express server environment: ' + app.get('user'));
//console.log('Express server environment: ' + app.get('USER'));



module.exports = app;