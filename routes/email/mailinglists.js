var pg = require('pg');
var config = require('../../config.js');
var conString = config.conString;



exports.getMailingList = function(pid, listName, callback){
	console.log("mailinglist API Call: getMailingList");

	var client = new pg.Client(conString);
	client.connect(function(err) {
		if(err) {
		return console.error('could not connect to postgres', err);
		}

		var query = "select json_array_elements(mailinglists->'"+listName+"') as mail from projects where pid = "+pid;
		client.query(query, function(err, result) {
			if(err) {
				client.end();
				callback([], listName, pid);
				return console.error('mailinglist.getMailingList error running query', err);
			}

			callback(result.rows, listName, pid);
			client.end();

		});
	});
}