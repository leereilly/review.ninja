// module
var github = require('../services/github');
var app = require('../app');

var Conf = require('mongoose').model('Conf');
var Repo = require('mongoose').model('Repo');

module.exports = {

	getAll: function(pulls, done){


		console.log('PULLS');
		console.log(pulls);


		var repo;	
		try {
			repo = pulls[0].base.repo.id;
		}
		catch(ex) {
			repo = null;
		}


		Conf.findOne({
			user: pulls.body.user.id,
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
	}

};