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
        
        var wrap = req.args.wrap; delete req.args.wrap;

        github.call(merge(req.args, {
            token: req.user.token
        }), function(err, res, meta) {

            if(err) {
                return done(err);
            }

            api[wrap.obj][wrap.fun](res, function(err, res) {
                done(err, {
                    data: res,
                    meta: meta
                });
            });
        });
    }

};
