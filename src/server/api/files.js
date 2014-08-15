// module
var parse = require('parse-diff');
var github = require('../services/github');

// TO DO
// RENAME THIS MODULE TO SOMETHING MORE OBVIOUS

module.exports = {

    get: function(req, done) {

        github.call({
            obj:'gitdata', 
            fun: 'getBlob',
            arg: {
                user: req.args.user,
                repo: req.args.repo,
                sha: req.args.sha
            },
            token: req.user.token
        }, function(err, res) {

            if(!err) {

                try {
                    res.content = parse(new Buffer(res.content, res.encoding).toString());
                }
                catch(ex) {
                    res.content = null;
                }
            }

            done(err, res);
        });

    },

    all: function(req, done) {

        github.call({
            obj:'pullRequests', 
            fun: 'getFiles',
            arg: {
                user: req.args.user,
                repo: req.args.repo,
                number: req.args.number
            },
            token: req.user.token
        }, function(err, files) {

            if(!err) {
                files.forEach(function(file) {
                    file.patch = parse(file.patch);
                });
            }

            done(err, files);
        });

    },

    compare: function(req, done) {

        github.call({
            obj: 'repos',
            fun: 'compareCommits',
            arg: {
                user: req.args.user,
                repo: req.args.repo,
                base: req.args.base,
                head: req.args.head
            }
        }, function(err, res) {
            
            if(!err) {
                res.files.forEach(function(file) {
                    file.patch = parse(file.patch);
                });
            }

            done(err, res);
        });
    }

};