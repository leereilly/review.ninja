var logger = require('../log');
// models
var Repo = require('mongoose').model('Repo');
var User = require('mongoose').model('User');

//services
var github = require('../services/github');
var notification = require('../services/notification');
var status = require('../services/status');

//////////////////////////////////////////////////////////////////////////////////////////////
// Github Pull Request Webhook Handler
//////////////////////////////////////////////////////////////////////////////////////////////

module.exports = function(req, res) {

    var uuid = req.body.repository.id;

    //
    // Helper functions
    //

    function get_collaborators(user, repo, token, done) {

        github.call({
            obj: 'repos',
            fun: 'getCollaborators',
            arg: {
                user: user,
                repo: repo
            },
            token: token
        }, function(err, collaborators) {

            if(err) {
                return done(err);
            }

            var collaborator_ids = collaborators.map(function(collaborator) {
                return collaborator.id;
            });
            
            User.find().where('uuid').in(collaborator_ids).exec(function(err, collaborators) {
                done(err, collaborators);
            });
        });
    }


    function get_issues(user, repo, pull_request_label, token, done) {
        
        github.call({
            obj: 'issues',
            fun: 'repoIssues',
            arg: {
                user: user,
                repo: repo,
                labels: 'review.ninja, ' + pull_request_label,
                state:'open'
            },
            token: token
        }, function(err, issues) {
            done(err,issues);
        });
    }


    function get_pull_request(user, repo, number, token, done){

        github.call({
            obj:'pullRequests',
            fun:'get',
            arg: {
                user: user,
                repo: repo,
                number:number
            },
            token:token
        }, function(err, pull_request){
            done(err, pull_request);
        });
    }


    function get_pull_request_number(labels) {

        var pull_request_number = null;

        for(var i=0; i<labels.length; i++){

            var reg = /pull-request-(\d*)?/;
            var match = reg.exec(labels[i].name); 

            if (match) {
                pull_request_number = match[1];
                break;
            }
        }

        return pull_request_number;
    }


    //
    // do we need to do this?
    //
    function has_review(labels) {

        for(var i=0; i<labels.length; i++) {
            if(labels[i].name === 'review.ninja'){
                return true;
            }
        }

        return false;
    }


    Repo.with({
        uuid: uuid
    }, function(err, repo) {

        if (err) {
            return logger.log(err);
        }

        if (repo.ninja) {

            // to be reviewed by review.ninja so let's go on

            var action = req.body.action;
            var issue = req.body.issue;
            var number = req.body.issue.number;
            var labels = req.body.issue.labels;
            var state = req.body.issue.state;
            var assignee = req.body.issue.assignee;
            var sender = req.body.sender;
            var user = req.body.repository.owner.login;
            var repo_name = req.body.repository.name;
            var review_url = req.body.issue.url;


            var actions = {

                opened: function() {

                    if( has_review(labels) ) {

                        var pull_request_number = get_pull_request_number(labels);

                        if( pull_request_number ) {

                            get_pull_request(user, repo_name, pull_request_number, repo.token, function(err, pull_request) {

                                if(err) {
                                    return logger.log(err);
                                }

                                status.update({
                                    user: user,
                                    repo: repo_name,
                                    repo_uuid: uuid,
                                    sha: pull_request.head.sha,
                                    number: pull_request.number,
                                    token: repo.token
                                }, function(err, data) {
                                    
                                });

                                notification.new_issue(user, sender, pull_request_number, review_url, repo, repo_name);
                            });
                        }
                    }

                },

                closed: function() {

                    if( has_review(labels) ) {

                        var pull_request_number = get_pull_request_number(labels);

                        if( pull_request_number ) {

                            get_issues(user, repo_name, label.name, repo.token, function(err, issues){
                                        
                                if(err){
                                    return logger.log(err);
                                }
                                if(issues.length){
                                    return;
                                }


                                get_pull_request(user, repo_name, pull_request_number, repo.token, function(err, pull_request){

                                    if(err){
                                        return logger.log(err);
                                    }

                                    status.update({
                                        user: user,
                                        repo: repo_name,
                                        repo_uuid: uuid,
                                        sha: pull_request.head.sha,
                                        number: pull_request.number,
                                        token: repo.token
                                    }, function(err, data) {
                                        
                                    });

                                    notification.issues_closed(user, sender, pull_request_number, review_url, repo, repo_name);
                                });

                            });
                        }
                    }
                },

                reopened: function() {
                    // an issue has been reopened
                    // send messages to responsible users?
                }
            };

            if (!actions[action]) {
                return logger.log('unsupported action for issues');
            }

            actions[action]();
        }
    });

    res.end();
};
