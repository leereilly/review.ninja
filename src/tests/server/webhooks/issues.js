require('trace.ninja');

var request = require('supertest');
var express = require('express');
var http = require('http');

var bodyParser = require('body-parser');
// unit test
var assert = require('assert');
var sinon = require('sinon');
var config = require('../../../config');

var logger = require('../../../server/log');
var mongoose = require('mongoose');
// models
var User2 = require('../../../server/documents/user');
var Repo2 = require('../../../server/documents/repo');
var Star = require('../../../server/documents/star');
var conf = require('../../../server/documents/conf');
mongoose.model('User');
mongoose.model('Star');
mongoose.model('Conf');

var Repo=mongoose.model('Repo');
var User = mongoose.model('User');
//services
var github = require('../../../server/services/github');
var status = require('../../../server/services/status');
var notification = require('../../../server/services/notification');
var Issue = require('../../../server/webhooks/issues');


// beforeEach(function(){
    
//     stub_github_status_api = sinon.stub(status, 'update', function(args, done){
//         done();
//     });

//     stub_user_find = sinon.stub(User,'find', function(args,done){

//         var find= {
//             where: function(uuid) {

//                 var where = {
//                     in: function(collaborators) {

//                         var inside = {
//                             exec : function() {
//                                 var err = null;
//                                 return (err,'collab');
//                             }
//                         };

//                         return inside;
//                     }
//                 };                                   
//                 return where;
//             }
//         };

//         return find;
//     });

// });

describe('issue webhook', function(){

    it('should set status', function(done) {

        var req = {
            'body': {
                'action': 'opened',
                'issue': {
                    'url': 'https://api.github.com/repos/baxterthehacker/public-repo/issues/49',
                    'number': 49,
                    'labels': [
                        { 'name': 'review.ninja' },
                        { 'name': 'pull-request-123' },
                    ],
                    'state': 'open',
                    'assignee': null
                },
                'sender': null,
                'repository': {
                    'id': 20000106,
                    'name': 'public-repo',
                    'owner': {
                        'login': 'baxterthehacker'
                    }
                }
            }
        };

        var res= {
            end: function(){
                done();
            }
        };

        stub_user_find = sinon.stub(User,'find', function(args,done){

            var find= {
                where: function(uuid) {

                    var where = {
                        in: function(collaborators) {

                            var inside = {
                                exec : function() {
                                    var err = null;
                                    return (err,'collab');
                                }
                            };

                            return inside;
                        }
                    };                                   
                    return where;
                }
            };

            return find;
        });

        stub_repo_with =  sinon.stub(Repo, 'with', function(args, done){
            var err = null;
            var repo = {
                ninja:true,
                token:'token'
            };
            done(err,repo);
        });

        stub_gitub_get_pull = sinon.stub(github, 'call', function(args, done) {
            
            assert.equal(args.obj, 'pullRequests');
            assert.equal(args.fun, 'get');
            assert.equal(args.arg.number, '123');

            done({
                number: 123,
                head: {
                    sha: '123123123'
                }
            });
        });

        stub_github_status_api = sinon.stub(status, 'update', function(args, done){
            done();
        });
        

        issue = Issue(req, res);

        stub_gitub_get_pull.restore();

    });

//     it('should send notification', function(done){

//         stub_github_call = sinon.stub(github, 'call', function(args, done){

//             if(args.fun == 'getIssues'){
//               var issues = [];
//               err = null;
//               done(err,issues);
//             }else if(args.fun == 'get' && args.obj == 'pullRequests'){

//               var pull_request = {
//                 head: {
//                   sha: '123'
//                 }
//               };
//               err =null;
//               done(err,pull_request);
//             }
//         });


//         stub_github_status_api = sinon.stub(status, 'update', function(args,done){
//           done();
//         });

//         stub_notification_new_issue = sinon.stub(notification,'new_issue', function(user, sender,issue_number,review_url, repo, repo_name){
//             assert.equal(issue_number,123);
//             done();
//         });

//         stub_user_find = sinon.stub(User,'find', function(args,done){

//           var find= {
//               where: function(uuid){

//                 var where = {
//                     in : function(collaborators){

//                       var inside = {
//                         exec : function(){
//                           var err = null;
//                           return (err,'collab');
//                         }
//                       };

//                       return inside;
//                     }

//               };                                      
//             return where;


//             }
//           };

//             return find;

//       });



//         stub_repo_with=  sinon.stub(Repo,'with', function(args,done){
           
//             var err = null;
//             var repo = {
//                 ninja:true,
//                 token:'token'
//             };
//             done(err,repo);
//         });


//     var req={

//       body:{
//         'action': 'opened',
//         'issue': {
//           'url': 'https://api.github.com/repos/baxterthehacker/public-repo/issues/49',
//           'labels_url': 'https://api.github.com/repos/baxterthehacker/public-repo/issues/49/labels{/name}',
//           'comments_url': 'https://api.github.com/repos/baxterthehacker/public-repo/issues/49/comments',
//           'events_url': 'https://api.github.com/repos/baxterthehacker/public-repo/issues/49/events',
//           'html_url': 'https://github.com/baxterthehacker/public-repo/issues/49',
//           'id': 38748335,
//           'number': 49,
//           'title': 'Spelling error in the README file',
//           'user': {
//             'login': 'baxterthehacker',
//             'id': 6752317,
//             'avatar_url': 'https://avatars.githubusercontent.com/u/6752317?',
//             'gravatar_id': '258ae60b5512c8402b93673b7478d9c6',
//             'url': 'https://api.github.com/users/baxterthehacker',
//             'html_url': 'https://github.com/baxterthehacker',
//             'followers_url': 'https://api.github.com/users/baxterthehacker/followers',
//             'following_url': 'https://api.github.com/users/baxterthehacker/following{/other_user}',
//             'gists_url': 'https://api.github.com/users/baxterthehacker/gists{/gist_id}',
//             'starred_url': 'https://api.github.com/users/baxterthehacker/starred{/owner}{/repo}',
//             'subscriptions_url': 'https://api.github.com/users/baxterthehacker/subscriptions',
//             'organizations_url': 'https://api.github.com/users/baxterthehacker/orgs',
//             'repos_url': 'https://api.github.com/users/baxterthehacker/repos',
//             'events_url': 'https://api.github.com/users/baxterthehacker/events{/privacy}',
//             'received_events_url': 'https://api.github.com/users/baxterthehacker/received_events',
//             'type': 'User',
//             'site_admin': false
//           },
//           'labels': [
//             {
//               'url': 'https://api.github.com/repos/baxterthehacker/public-repo/labels/bug',
//               'name': 'review.ninja',
//               'color': 'fc2929'
//             },
//             {
//               'url': 'https://api.github.com/repos/baxterthehacker/public-repo/labels/bug',
//               'name': 'pull-request-123',
//               'color': 'fc2929'
//             }
//           ],
//           'state': 'open',
//           'assignee': null,
//           'milestone': null,
//           'comments': 1,
//           'created_at': '2014-07-25T16:37:42Z',
//           'updated_at': '2014-07-25T16:37:42Z',
//           'closed_at': null,
//           'body': 'It looks like you accidently spelled "commit" with two "t"s.'
//         },
//         'repository': {
//           'id': 20000106,
//           'name': 'public-repo',
//           'full_name': 'baxterthehacker/public-repo',
//           'owner': {
//             'login': 'baxterthehacker',
//             'id': 6752317,
//             'avatar_url': 'https://avatars.githubusercontent.com/u/6752317?',
//             'gravatar_id': '258ae60b5512c8402b93673b7478d9c6',
//             'url': 'https://api.github.com/users/baxterthehacker',
//             'html_url': 'https://github.com/baxterthehacker',
//             'followers_url': 'https://api.github.com/users/baxterthehacker/followers',
//             'following_url': 'https://api.github.com/users/baxterthehacker/following{/other_user}',
//             'gists_url': 'https://api.github.com/users/baxterthehacker/gists{/gist_id}',
//             'starred_url': 'https://api.github.com/users/baxterthehacker/starred{/owner}{/repo}',
//             'subscriptions_url': 'https://api.github.com/users/baxterthehacker/subscriptions',
//             'organizations_url': 'https://api.github.com/users/baxterthehacker/orgs',
//             'repos_url': 'https://api.github.com/users/baxterthehacker/repos',
//             'events_url': 'https://api.github.com/users/baxterthehacker/events{/privacy}',
//             'received_events_url': 'https://api.github.com/users/baxterthehacker/received_events',
//             'type': 'User',
//             'site_admin': false
//           },
//           'private': false,
//           'html_url': 'https://github.com/baxterthehacker/public-repo',
//           'description': '',
//           'fork': false,
//           'url': 'https://api.github.com/repos/baxterthehacker/public-repo',
//           'forks_url': 'https://api.github.com/repos/baxterthehacker/public-repo/forks',
//           'keys_url': 'https://api.github.com/repos/baxterthehacker/public-repo/keys{/key_id}',
//           'collaborators_url': 'https://api.github.com/repos/baxterthehacker/public-repo/collaborators{/collaborator}',
//           'teams_url': 'https://api.github.com/repos/baxterthehacker/public-repo/teams',
//           'hooks_url': 'https://api.github.com/repos/baxterthehacker/public-repo/hooks',
//           'issue_events_url': 'https://api.github.com/repos/baxterthehacker/public-repo/issues/events{/number}',
//           'events_url': 'https://api.github.com/repos/baxterthehacker/public-repo/events',
//           'assignees_url': 'https://api.github.com/repos/baxterthehacker/public-repo/assignees{/user}',
//           'branches_url': 'https://api.github.com/repos/baxterthehacker/public-repo/branches{/branch}',
//           'tags_url': 'https://api.github.com/repos/baxterthehacker/public-repo/tags',
//           'blobs_url': 'https://api.github.com/repos/baxterthehacker/public-repo/git/blobs{/sha}',
//           'git_tags_url': 'https://api.github.com/repos/baxterthehacker/public-repo/git/tags{/sha}',
//           'git_refs_url': 'https://api.github.com/repos/baxterthehacker/public-repo/git/refs{/sha}',
//           'trees_url': 'https://api.github.com/repos/baxterthehacker/public-repo/git/trees{/sha}',
//           'statuses_url': 'https://api.github.com/repos/baxterthehacker/public-repo/statuses/{sha}',
//           'languages_url': 'https://api.github.com/repos/baxterthehacker/public-repo/languages',
//           'stargazers_url': 'https://api.github.com/repos/baxterthehacker/public-repo/stargazers',
//           'contributors_url': 'https://api.github.com/repos/baxterthehacker/public-repo/contributors',
//           'subscribers_url': 'https://api.github.com/repos/baxterthehacker/public-repo/subscribers',
//           'subscription_url': 'https://api.github.com/repos/baxterthehacker/public-repo/subscription',
//           'commits_url': 'https://api.github.com/repos/baxterthehacker/public-repo/commits{/sha}',
//           'git_commits_url': 'https://api.github.com/repos/baxterthehacker/public-repo/git/commits{/sha}',
//           'comments_url': 'https://api.github.com/repos/baxterthehacker/public-repo/comments{/number}',
//           'issue_comment_url': 'https://api.github.com/repos/baxterthehacker/public-repo/issues/comments/{number}',
//           'contents_url': 'https://api.github.com/repos/baxterthehacker/public-repo/contents/{+path}',
//           'compare_url': 'https://api.github.com/repos/baxterthehacker/public-repo/compare/{base}...{head}',
//           'merges_url': 'https://api.github.com/repos/baxterthehacker/public-repo/merges',
//           'archive_url': 'https://api.github.com/repos/baxterthehacker/public-repo/{archive_format}{/ref}',
//           'downloads_url': 'https://api.github.com/repos/baxterthehacker/public-repo/downloads',
//           'issues_url': 'https://api.github.com/repos/baxterthehacker/public-repo/issues{/number}',
//           'pulls_url': 'https://api.github.com/repos/baxterthehacker/public-repo/pulls{/number}',
//           'milestones_url': 'https://api.github.com/repos/baxterthehacker/public-repo/milestones{/number}',
//           'notifications_url': 'https://api.github.com/repos/baxterthehacker/public-repo/notifications{?since,all,participating}',
//           'labels_url': 'https://api.github.com/repos/baxterthehacker/public-repo/labels{/name}',
//           'releases_url': 'https://api.github.com/repos/baxterthehacker/public-repo/releases{/id}',
//           'created_at': '2014-05-20T22:39:43Z',
//           'updated_at': '2014-07-25T16:37:43Z',
//           'pushed_at': '2014-07-25T16:37:42Z',
//           'git_url': 'git://github.com/baxterthehacker/public-repo.git',
//           'ssh_url': 'git@github.com:baxterthehacker/public-repo.git',
//           'clone_url': 'https://github.com/baxterthehacker/public-repo.git',
//           'svn_url': 'https://github.com/baxterthehacker/public-repo',
//           'homepage': null,
//           'size': 612,
//           'stargazers_count': 0,
//           'watchers_count': 0,
//           'language': null,
//           'has_issues': true,
//           'has_downloads': true,
//           'has_wiki': true,
//           'forks_count': 1,
//           'mirror_url': null,
//           'open_issues_count': 25,
//           'forks': 1,
//           'open_issues': 25,
//           'watchers': 0,
//           'default_branch': 'master'
//         },
//         'sender': {
//           'login': 'baxterthehacker',
//           'id': 6752317,
//           'avatar_url': 'https://avatars.githubusercontent.com/u/6752317?',
//           'gravatar_id': '258ae60b5512c8402b93673b7478d9c6',
//           'url': 'https://api.github.com/users/baxterthehacker',
//           'html_url': 'https://github.com/baxterthehacker',
//           'followers_url': 'https://api.github.com/users/baxterthehacker/followers',
//           'following_url': 'https://api.github.com/users/baxterthehacker/following{/other_user}',
//           'gists_url': 'https://api.github.com/users/baxterthehacker/gists{/gist_id}',
//           'starred_url': 'https://api.github.com/users/baxterthehacker/starred{/owner}{/repo}',
//           'subscriptions_url': 'https://api.github.com/users/baxterthehacker/subscriptions',
//           'organizations_url': 'https://api.github.com/users/baxterthehacker/orgs',
//           'repos_url': 'https://api.github.com/users/baxterthehacker/repos',
//           'events_url': 'https://api.github.com/users/baxterthehacker/events{/privacy}',
//           'received_events_url': 'https://api.github.com/users/baxterthehacker/received_events',
//           'type': 'User',
//           'site_admin': false
//         }
//       }

//     };

//     var res= {
//         end: function(){
//             done();
//         }
//     };

//     var issue = new Issue (req,res);



//     });




//   it('should send notification when all issues are closed', function(done){

//         stub_github_call = sinon.stub(github, 'call', function(args, done){
//             if(args.fun == 'repoIssues'){
//               var issues = [];
//               err = null;
//               done(err,issues);
//             }else if(args.fun == 'get' && args.obj == 'pullRequests'){
//               var pull_request = {
//                 head: {
//                   sha: '123'
//                 }
//               };
//               err =null;
//               done(err,pull_request);
//             }
//         });


//         stub_github_status_api = sinon.stub(status, 'update', function(args,done){
//           done();
//         });

//         stub_notification_issues_closed = sinon.stub(notification,'issues_closed', function(user, sender,issue_number,review_url, repo, repo_name){
//             assert.equal(issue_number,123);
//             done();
//         });

//         stub_user_find = sinon.stub(User,'find', function(args,done){
//           var find= {
//               where: function(uuid){

//                 var where = {
//                     in : function(collaborators){

//                       var inside = {
//                         exec : function(){

//                           var err = null;
//                           return (err,'collab');
//                         }
//                       };

//                       return inside;
//                     }

//               };                                      
//             return where;


//             }
//           };

//             return find;

//       });



//         stub_repo_with=  sinon.stub(Repo,'with', function(args,done){
//             var err = null;
//             var repo = {
//                 ninja:true,
//                 token:'token'
//             };
//             done(err,repo);
//         });


// var req={

//   body:{
//     'action': 'closed',
//     'issue': {
//       'url': 'https://api.github.com/repos/baxterthehacker/public-repo/issues/49',
//       'labels_url': 'https://api.github.com/repos/baxterthehacker/public-repo/issues/49/labels{/name}',
//       'comments_url': 'https://api.github.com/repos/baxterthehacker/public-repo/issues/49/comments',
//       'events_url': 'https://api.github.com/repos/baxterthehacker/public-repo/issues/49/events',
//       'html_url': 'https://github.com/baxterthehacker/public-repo/issues/49',
//       'id': 38748335,
//       'number': 49,
//       'title': 'Spelling error in the README file',
//       'user': {
//         'login': 'baxterthehacker',
//         'id': 6752317,
//         'avatar_url': 'https://avatars.githubusercontent.com/u/6752317?',
//         'gravatar_id': '258ae60b5512c8402b93673b7478d9c6',
//         'url': 'https://api.github.com/users/baxterthehacker',
//         'html_url': 'https://github.com/baxterthehacker',
//         'followers_url': 'https://api.github.com/users/baxterthehacker/followers',
//         'following_url': 'https://api.github.com/users/baxterthehacker/following{/other_user}',
//         'gists_url': 'https://api.github.com/users/baxterthehacker/gists{/gist_id}',
//         'starred_url': 'https://api.github.com/users/baxterthehacker/starred{/owner}{/repo}',
//         'subscriptions_url': 'https://api.github.com/users/baxterthehacker/subscriptions',
//         'organizations_url': 'https://api.github.com/users/baxterthehacker/orgs',
//         'repos_url': 'https://api.github.com/users/baxterthehacker/repos',
//         'events_url': 'https://api.github.com/users/baxterthehacker/events{/privacy}',
//         'received_events_url': 'https://api.github.com/users/baxterthehacker/received_events',
//         'type': 'User',
//         'site_admin': false
//       },
//       'labels': [
//         {
//           'url': 'https://api.github.com/repos/baxterthehacker/public-repo/labels/bug',
//           'name': 'review.ninja',
//           'color': 'fc2929'
//         },
//         {
//           'url': 'https://api.github.com/repos/baxterthehacker/public-repo/labels/bug',
//           'name': 'pull-request-123',
//           'color': 'fc2929'
//         }
//       ],
//       'state': 'closed',
//       'assignee': null,
//       'milestone': null,
//       'comments': 1,
//       'created_at': '2014-07-25T16:37:42Z',
//       'updated_at': '2014-07-25T16:37:42Z',
//       'closed_at': null,
//       'body': 'It looks like you accidently spelled "commit" with two "t"s.'
//     },
//     'repository': {
//       'id': 20000106,
//       'name': 'public-repo',
//       'full_name': 'baxterthehacker/public-repo',
//       'owner': {
//         'login': 'baxterthehacker',
//         'id': 6752317,
//         'avatar_url': 'https://avatars.githubusercontent.com/u/6752317?',
//         'gravatar_id': '258ae60b5512c8402b93673b7478d9c6',
//         'url': 'https://api.github.com/users/baxterthehacker',
//         'html_url': 'https://github.com/baxterthehacker',
//         'followers_url': 'https://api.github.com/users/baxterthehacker/followers',
//         'following_url': 'https://api.github.com/users/baxterthehacker/following{/other_user}',
//         'gists_url': 'https://api.github.com/users/baxterthehacker/gists{/gist_id}',
//         'starred_url': 'https://api.github.com/users/baxterthehacker/starred{/owner}{/repo}',
//         'subscriptions_url': 'https://api.github.com/users/baxterthehacker/subscriptions',
//         'organizations_url': 'https://api.github.com/users/baxterthehacker/orgs',
//         'repos_url': 'https://api.github.com/users/baxterthehacker/repos',
//         'events_url': 'https://api.github.com/users/baxterthehacker/events{/privacy}',
//         'received_events_url': 'https://api.github.com/users/baxterthehacker/received_events',
//         'type': 'User',
//         'site_admin': false
//       },
//       'private': false,
//       'html_url': 'https://github.com/baxterthehacker/public-repo',
//       'description': '',
//       'fork': false,
//       'url': 'https://api.github.com/repos/baxterthehacker/public-repo',
//       'forks_url': 'https://api.github.com/repos/baxterthehacker/public-repo/forks',
//       'keys_url': 'https://api.github.com/repos/baxterthehacker/public-repo/keys{/key_id}',
//       'collaborators_url': 'https://api.github.com/repos/baxterthehacker/public-repo/collaborators{/collaborator}',
//       'teams_url': 'https://api.github.com/repos/baxterthehacker/public-repo/teams',
//       'hooks_url': 'https://api.github.com/repos/baxterthehacker/public-repo/hooks',
//       'issue_events_url': 'https://api.github.com/repos/baxterthehacker/public-repo/issues/events{/number}',
//       'events_url': 'https://api.github.com/repos/baxterthehacker/public-repo/events',
//       'assignees_url': 'https://api.github.com/repos/baxterthehacker/public-repo/assignees{/user}',
//       'branches_url': 'https://api.github.com/repos/baxterthehacker/public-repo/branches{/branch}',
//       'tags_url': 'https://api.github.com/repos/baxterthehacker/public-repo/tags',
//       'blobs_url': 'https://api.github.com/repos/baxterthehacker/public-repo/git/blobs{/sha}',
//       'git_tags_url': 'https://api.github.com/repos/baxterthehacker/public-repo/git/tags{/sha}',
//       'git_refs_url': 'https://api.github.com/repos/baxterthehacker/public-repo/git/refs{/sha}',
//       'trees_url': 'https://api.github.com/repos/baxterthehacker/public-repo/git/trees{/sha}',
//       'statuses_url': 'https://api.github.com/repos/baxterthehacker/public-repo/statuses/{sha}',
//       'languages_url': 'https://api.github.com/repos/baxterthehacker/public-repo/languages',
//       'stargazers_url': 'https://api.github.com/repos/baxterthehacker/public-repo/stargazers',
//       'contributors_url': 'https://api.github.com/repos/baxterthehacker/public-repo/contributors',
//       'subscribers_url': 'https://api.github.com/repos/baxterthehacker/public-repo/subscribers',
//       'subscription_url': 'https://api.github.com/repos/baxterthehacker/public-repo/subscription',
//       'commits_url': 'https://api.github.com/repos/baxterthehacker/public-repo/commits{/sha}',
//       'git_commits_url': 'https://api.github.com/repos/baxterthehacker/public-repo/git/commits{/sha}',
//       'comments_url': 'https://api.github.com/repos/baxterthehacker/public-repo/comments{/number}',
//       'issue_comment_url': 'https://api.github.com/repos/baxterthehacker/public-repo/issues/comments/{number}',
//       'contents_url': 'https://api.github.com/repos/baxterthehacker/public-repo/contents/{+path}',
//       'compare_url': 'https://api.github.com/repos/baxterthehacker/public-repo/compare/{base}...{head}',
//       'merges_url': 'https://api.github.com/repos/baxterthehacker/public-repo/merges',
//       'archive_url': 'https://api.github.com/repos/baxterthehacker/public-repo/{archive_format}{/ref}',
//       'downloads_url': 'https://api.github.com/repos/baxterthehacker/public-repo/downloads',
//       'issues_url': 'https://api.github.com/repos/baxterthehacker/public-repo/issues{/number}',
//       'pulls_url': 'https://api.github.com/repos/baxterthehacker/public-repo/pulls{/number}',
//       'milestones_url': 'https://api.github.com/repos/baxterthehacker/public-repo/milestones{/number}',
//       'notifications_url': 'https://api.github.com/repos/baxterthehacker/public-repo/notifications{?since,all,participating}',
//       'labels_url': 'https://api.github.com/repos/baxterthehacker/public-repo/labels{/name}',
//       'releases_url': 'https://api.github.com/repos/baxterthehacker/public-repo/releases{/id}',
//       'created_at': '2014-05-20T22:39:43Z',
//       'updated_at': '2014-07-25T16:37:43Z',
//       'pushed_at': '2014-07-25T16:37:42Z',
//       'git_url': 'git://github.com/baxterthehacker/public-repo.git',
//       'ssh_url': 'git@github.com:baxterthehacker/public-repo.git',
//       'clone_url': 'https://github.com/baxterthehacker/public-repo.git',
//       'svn_url': 'https://github.com/baxterthehacker/public-repo',
//       'homepage': null,
//       'size': 612,
//       'stargazers_count': 0,
//       'watchers_count': 0,
//       'language': null,
//       'has_issues': true,
//       'has_downloads': true,
//       'has_wiki': true,
//       'forks_count': 1,
//       'mirror_url': null,
//       'open_issues_count': 25,
//       'forks': 1,
//       'open_issues': 25,
//       'watchers': 0,
//       'default_branch': 'master'
//     },
//     'sender': {
//       'login': 'baxterthehacker',
//       'id': 6752317,
//       'avatar_url': 'https://avatars.githubusercontent.com/u/6752317?',
//       'gravatar_id': '258ae60b5512c8402b93673b7478d9c6',
//       'url': 'https://api.github.com/users/baxterthehacker',
//       'html_url': 'https://github.com/baxterthehacker',
//       'followers_url': 'https://api.github.com/users/baxterthehacker/followers',
//       'following_url': 'https://api.github.com/users/baxterthehacker/following{/other_user}',
//       'gists_url': 'https://api.github.com/users/baxterthehacker/gists{/gist_id}',
//       'starred_url': 'https://api.github.com/users/baxterthehacker/starred{/owner}{/repo}',
//       'subscriptions_url': 'https://api.github.com/users/baxterthehacker/subscriptions',
//       'organizations_url': 'https://api.github.com/users/baxterthehacker/orgs',
//       'repos_url': 'https://api.github.com/users/baxterthehacker/repos',
//       'events_url': 'https://api.github.com/users/baxterthehacker/events{/privacy}',
//       'received_events_url': 'https://api.github.com/users/baxterthehacker/received_events',
//       'type': 'User',
//       'site_admin': false
//     }
//   }

// };

//     var res= {
//         end: function(){
//             done();
//         }
//     };

//     var issue = new Issue (req,res);






//   });


afterEach(function(){
  stub_github_call.restore();
  stub_github_status_api.restore();
  stub_user_find.restore();
  stub_repo_with.restore();
});

});