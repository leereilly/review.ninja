require('trace.ninja');

// unit test
var assert = require('assert');
var sinon = require('sinon');
var mongoose = require('mongoose');

require('../../../server/documents/conf');
var Conf = mongoose.model('Conf');

require('../../../server/documents/repo');
mongoose.model('Repo');

// api
var pull = require('../../../server/api/pull');
var github = require('../../../server/services/github');


mongoose.model('Conf');

describe('pull: getAll', function(){

	it('should get all pullrequests', function(done){

		var req = {
			body:{
				user:'reviewninja',
				repo: 'foo',
				state: 'all'
			},
			user:{
				token: '3004a2ac4c2055dfed8258274fb697bd8638bf32'
			}
		};



		github_call_stub = sinon.stub(github,'call', function(args, done){


			if(args.fun == 'getAll' && args.obj == 'pullRequests'){

				var pull = {
					base:{
						label:'reviewninja:master'
					},
					head:{
						label: 'reviewninja:feature/one'
					}
				};

				var pulls = [pull];

				var err = null;

				done(err,pulls);

			}else if (args.fun == 'get' && args.obj == 'repos'){

				var repo = {
					id:'123'
				};

				var error = null;

				done(error,repo);

			}


		});


		conf_find_one_stub = sinon.stub(Conf,'findOne', function(args,done){

			var reg = 'feature/.*';

			var conf = {
				watch : [reg]
			};

			var err = null;

			done(err,conf);

		});


		pull.getAll(req,function(err,res){
			console.log(res);
			assert.equal(res[0].watched,true);
			done();

		});

	});

	afterEach(function(){
		conf_find_one_stub.restore();
		github_call_stub.restore();
	});

});
