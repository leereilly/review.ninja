// module
var github = require('../services/github');
var app = require('../app');

var Conf = require('mongoose').model('Conf');
var Repo = require('mongoose').model('Repo');

module.exports = {

	getAll: function(req, done){

		console.log('***');
		console.log(req);
		console.log('***');

		req = 'holy shit';

		return done(null, req);


		github.call({
			obj: 'pullRequests',
			fun: 'getAll',
			arg:{
				user: req.body.user,
				repo: req.body.repo,
				state: req.body.state
			}
		}, function(err, pulls, meta){

			// console.log('META');
			// console.log(meta);

			if(err){
				return done(err, pulls);
			}

			var repo;	

			pulls.meta = meta;

			// console.log(pulls);

			try {
				repo = pulls[0].base.repo.id;
			}
			catch(ex) {
				repo = null;
			}


			Conf.findOne({
				user: req.user.id,
				repo: repo
			}, function(err,conf){

				if(!err && conf) {

					pulls.forEach(function(pull){

						pull.watched = false;

						for(var key=0; key<conf.watch.length; key++){

							var r = req.body.user + ':' + conf.watch[key];
							var re = new RegExp(r, 'g');

							if(re.exec(pull.base.label) || re.exec(pull.head.label)){

								pull.watched = true;
								break;
							}
						}

					});
					
				}
				done(err, pulls);

			});

		});


	}





};