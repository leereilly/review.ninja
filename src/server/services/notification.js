nodemailer = require('nodemailer');
logger = require('../log');
fs = require('fs');
ejs = require('ejs');

var Conf = require('mongoose').model('Conf');
var User = require('mongoose').model('User');
var github = require('./github');

module.exports = function() {

    function sendmail(user,subj,tmpl,notification_type,repo,repo_name,args){
        console.log('REPO');
        console.log(repo);
        get_collaborators(user,repo_name,repo.token, function(err,collaborators){

            if(err)
            {
                logger.log(err);
            }

            console.log(collaborators);
            collaborators.forEach(function(collaborator){

                var notified = false;

                Conf.findOne({
                    user: collaborator.uuid,
                    repo: repo.uuid
                }, function(err, conf) {
                    console.log('CONF');
                    console.log(conf);
                    if(conf){

                        if(notification_type == 'issue'){
                            if(conf.notifications.issue){
                                notified = true;
                            }
                        }else if(notification_type == 'pull_request'){
                            if(conf.notifications.pull_request){
                                notified = true;
                            }
                        }else if(notification_type == 'star'){
                             if(conf.notifications.star){
                                notified = true;
                            }                           
                        }

                    }



                    if(notified){
                        console.log('SENDING EMAIL');
                        var smtpTransport = nodemailer.createTransport('SMTP', config.server.smtp);

                        var template = fs.readFileSync(tmpl,'utf-8');
                        var mailOptions = {
                            from: 'RobotNinja ✔ <noreply@review.ninja>',
                            to:collaborator.email,
                            subject:subj,
                            html:ejs.render(template,args)
                        };

                        console.log('sending mail to');
                        console.log(mailOptions);
                        smtpTransport.sendMail(mailOptions, function(error, response) {
                           
                            if (error) {
                                logger.log(error);
                            }
                            smtpTransport.close();
                        });

                    }                

                });



            });

        });

    }

    function get_collaborators(user, repo, token, done) {
        var args = {
            user: user,
            repo: repo
        };
        console.log('ARGS');
        console.log(args);
        github.call({
            obj: 'repos',
            fun: 'getCollaborators',
            arg: args,
            token: token
        }, function(err, collaborators) {
            var collaborator_ids = collaborators.map(function(collaborator) {
                return collaborator.id;
            });
            
            User.find().where('uuid').in(collaborator_ids).exec(function(err, collaborators) {
                done(err, collaborators);
            });
        });
    }


    return {
        pull_request_opened: function(user, slug, number, sender, review_url, repo, repo_name) {
            // start a review: send messages to appropriate users
            var args={
                slug:slug,
                number:number,
                sender:sender,
                review_url:review_url
            };

            sendmail(user,'New Commits, you can now review them','src/server/templates/pullReqOpened.ejs','pull_request',repo,repo_name,args);


        },
        pull_request_synchronized: function(user,slug, number, sender, review_url, repo, repo_name) {
            // a pull request you have been reviewing has a new commit
            var args={
                slug:slug,
                number:number,
                sender:sender,
                review_url:review_url
            };   

            sendmail(user,'New Commits, you can now review them','src/server/templates/pullReqSync.ejs','pull_request',repo,repo_name,args);


        },
        star: function(user,starrer,number, repo, repo_name){
            console.log('starring');
            var args={
                starrer:starrer,
                number:number
            };

            sendmail(user,'Your pull request has been starred','./../templates/starred.ejs','star',repo,repo_name, args);


        },

        unstar: function(user,starrer, number,repo, repo_name){

            var args={
                starrer: starrer,
                number:number
            };

            sendmail(user,'Your pull request has been UNstarred','../templates/unstarred.ejs','star',repo,repo_name,args);


        },
        new_issue: function(user, sender,issue_number,review_url, repo, repo_name){
            console.log('new issue');
            var args= {
                review_url: review_url,
                issue_number: issue_number,
                sender:sender
            };

            sendmail(user,'A new issue has just been raised!!','src/server/templates/new_issue.ejs','issue',repo,repo_name, args);




        },
        issues_close: function(user, sender,number, review_url, repo, repo_name){

            var args= {
                review_url: review_url,
                number: number,
                sender:sender
            };

            sendmail(user,'All issues have just been closed','src/server/templates/issue_closed.ejs','issue',repo,repo_name,args);


        }
    };
}();


