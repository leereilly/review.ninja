// module
var github = require('../services/github');
var merge = require('merge');

var api = require('../app').api;

module.exports = {

    /************************************************************************************************************

    @github

    + <req.obj>.<req.fun>

************************************************************************************************************/

    call: function(req, done) {
        github.call(merge(req.args, {
            token: req.user.token
        }), function(err, res, meta) {
            done(err, {
                data: res,
                meta: meta
            });
        });
    },

    wrap: function(req, done) {
        
        github.call(merge(req.args, {
            token: req.user.token
        }), function(err, res, meta) {
            // console.log('REQ');
            // console.log(req);

            if(err) {
                return done(err);
            }

            api[req.args.obj][req.args.fun](req, res, function(err, res) {
                done(err, {
                    data: res,
                    meta: meta
                });
            });
        });
    }

};
