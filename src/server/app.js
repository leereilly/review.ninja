var async = require('async');
var colors = require('colors');
var express = require('express');
var glob = require('glob');
var merge = require('merge');
var passport = require('passport');
var path = require('path');
var rollbar = require('rollbar');

//////////////////////////////////////////////////////////////////////////////////////////////////
// Load configuration 
//////////////////////////////////////////////////////////////////////////////////////////////////

global.config = require('./../config');

//////////////////////////////////////////////////////////////////////////////////////////////////
// Express application
//////////////////////////////////////////////////////////////////////////////////////////////////

var app = express();
var api = {};
var webhooks = {};

// Setup rollbar
if (process.env.NODE_ENV === 'production')
    app.use(rollbar.errorHandler('51d783b209fd4c24927dc5e0b1270aef'));

config.server.static.forEach(function(p) {
    app.use(express.static(p));
});

app.use(require('body-parser').json());
app.use(require('cookie-parser')());
app.use(require('cookie-session')({
    secret: 'review.ninja!',
    cookie: {
        maxAge: 60 * 60 * 1000
    }
}));
app.use(passport.initialize());
app.use(passport.session());

// custom middleware
app.use('/api', require('./middleware/param'));
app.use('/api', require('./middleware/authenticated'));

// setup render engine
app.set('views', path.join(__dirname + '../../client'));
app.engine('html', require('ejs').renderFile);


async.series([

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Bootstrap mongoose
    //////////////////////////////////////////////////////////////////////////////////////////////

    function(callback) {

        console.log('bootstrap mongoose'.bold);

        var mongoose = require('mongoose');

        mongoose.connect(config.server.mongodb.uri, {
            server: {
                socketOptions: {
                    keepAlive: 1
                }
            }
        });

        global.models = {};

        async.eachSeries(config.server.documents, function(p, callback) {
            glob(p, function(err, file) {
                if (file && file.length && file.length > 0) {
                    file.forEach(function(f) {
                        try {
                            global.models = merge(global.models, require(f));
                            console.log('✓ '.bold.green + path.relative(process.cwd(), f));
                        } catch (ex) {
                            console.log('✖ '.bold.red + path.relative(process.cwd(), f));
                            console.log(ex.stack);
                        }
                    });
                    callback();
                }
            });
        }, callback);
    },

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Bootstrap passport
    //////////////////////////////////////////////////////////////////////////////////////////////

    function(callback) {

        console.log('bootstrap passport'.bold);

        async.eachSeries(config.server.passport, function(p, callback) {
            glob(p, function(err, file) {
                if (file && file.length && file.length > 0) {
                    file.forEach(function(f) {
                        console.log('✓ '.bold.green + path.relative(process.cwd(), f));
                        require(f);
                    });
                }
                callback();
            });
        }, callback);
    },

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Bootstrap controller
    //////////////////////////////////////////////////////////////////////////////////////////////

    function(callback) {

        console.log('bootstrap controller'.bold);

        async.eachSeries(config.server.controller, function(p, callback) {
            glob(p, function(err, file) {
                if (file && file.length && file.length > 0) {
                    file.forEach(function(f) {
                        try {
                            app.use('/', require(f));
                            console.log('✓ '.bold.green + path.relative(process.cwd(), f));
                        } catch (ex) {
                            console.log('✖ '.bold.red + path.relative(process.cwd(), f));
                            console.log(ex.stack);
                        }
                    });
                }
                callback();
            });
        }, callback);
    },

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Bootstrap api
    //////////////////////////////////////////////////////////////////////////////////////////////

    function(callback) {

        console.log('bootstrap api'.bold);

        async.eachSeries(config.server.api, function(p, callback) {
            glob(p, function(err, file) {
                if (file && file.length && file.length > 0) {
                    file.forEach(function(f) {
                        console.log('✓ '.bold.green + path.relative(process.cwd(), f));
                        api[path.basename(f, '.js')] = require(f);
                    });
                }
                callback();
            });
        }, callback());
    },

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Bootstrap webhooks
    //////////////////////////////////////////////////////////////////////////////////////////////

    function(callback) {

        console.log('bootstrap webhooks'.bold);

        async.eachSeries(config.server.webhooks, function(p, callback) {
            glob(p, function(err, file) {
                if (file && file.length && file.length > 0) {
                    file.forEach(function(f) {
                        console.log('✓ '.bold.green + path.relative(process.cwd(), f));
                        webhooks[path.basename(f, '.js')] = require(f);
                    });
                }
                callback();
            });
        }, callback());
    }

], function(err, res) {
    console.log('✓ '.bold.green + 'bootstrapped');
});

//////////////////////////////////////////////////////////////////////////////////////////////////
// Handle api calls
//////////////////////////////////////////////////////////////////////////////////////////////////

var logger = require('./log');

app.all('/api/:obj/:fun', function(req, res) {
    res.set('Content-Type', 'application/json');
    api[req.params.obj][req.params.fun](req, function(err, obj) {
        if (err) {
            console.log(('✖ ' + req.params.obj + ':' + req.params.fun).bold.red);
            console.log(err);
            res.send(err.code > 0 ? err.code : 500, JSON.stringify(err.text || err));
        } else {
            logger.log({
                api: req.params.obj,
                fun: req.params.fun,
                arg: req.args,
                res: obj
            }, ['api', req.params.obj, req.params.fun]);
            return obj ? res.send(JSON.stringify(obj)) : res.send();
        }
    });
});

//////////////////////////////////////////////////////////////////////////////////////////////////
// Handle webhook calls
//////////////////////////////////////////////////////////////////////////////////////////////////

app.all('/github/webhook', function(req, res) {
    var event = req.headers['x-github-event'];
    try {
        if (webhooks[event]) {
            webhooks[event](req, res);
            return;
        }
        res.send(400, 'Unsupported event');
    } catch (err) {
        logger.log(err);
        res.send(500, 'Internal Server Error');
    }
});

app.api = api;

module.exports = app;
