// module
var github = require('../services/github');
var app = require('../app');

var Conf = require('mongoose').model('Conf');


module.exports = {


	getAll: function(req, pulls, done){


		var repo;	
		try {
			repo = pulls[0].base.repo.id;
		}
		catch(ex) {
			repo = null;
		}

		console.log('REQ');
		console.log(req);

		Conf.findOne({
			user: req.user.id,
			repo: repo
		}, function(err,conf){

			if(!err && conf) {

				pulls.forEach(function(pull){

					pull.watched = false;

					for(var key=0; key<conf.watch.length; key++){

						var r = req.args.arg.user + ':' + conf.watch[key];
						var re = new RegExp(r, 'g');

						if(re.exec(pull.base.label) || re.exec(pull.head.label)){
							console.log('in here');

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