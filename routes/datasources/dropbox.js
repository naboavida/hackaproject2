// npm install dropbox --save
var Dropbox = require("dropbox");
var fs = require('fs');

// npm install excel node-xlsx --save
var xlsx = require('node-xlsx');


var client = new Dropbox.Client({
    key: "07mytm9eqdg4pr5",
    secret: "r7mn1ljnuu058i2",
    sandbox: false,
    token: "xVjd_rozOYAAAAAAAAAAKySUzZ8H0aX6qhQTG3iqsgpawdGLHYVp4kOIUvDPNUcN"
});



var returnResOrCallback = function(toReturn, res, callback){
	if(res != null){
		res.json(toReturn);
	} else {
		if (typeof callback === "function") {
			callback(toReturn);
		}
	}
}


exports.listPublicFolder = function(req, res, callback){
	console.log("dropbox call: listPublicFolder");
	console.log(req.body);
	var folder = req.body.folder + req.body.client_folder;


	client.authenticate(function(error, client) {
		if (error) {
			returnResOrCallback({"error": error}, res, callback);
			return console.log(error);
		}
		console.log("Successfully authenticated to dropbox");

		// client.getAccountInfo(function(error2, accountInfo) {
		//   if (error2) {
		//     res.json({"error": error2});
		// 	return console.log(error2);
		//   }

		//   console.log("Hello, " + accountInfo.name + "!");
		// });

		client.readdir(folder, function(error2, entries) {
			if (error2) {
				returnResOrCallback({"error": error2}, res, callback);
				return console.log(error);  // Something went wrong.
			}

			returnResOrCallback(entries, res, callback);
		});
	});
}

exports.fetchXlsxFile = function(req, res, callback){
	console.log("dropbox call: fetchXlsxFile");
	console.log(req.body);
	var folder = req.body.folder + req.body.client_folder;
	if(req.body.hasOwnProperty('client_folder_nodate') && req.body.hasOwnProperty('file_date')){
		folder = req.body.folder + req.body.client_folder_nodate + '/' + req.body.file_date + '/';
	}
	var filename = req.body.filename;

	client.authenticate(function(error, client) {
		if (error) {
			// res.json({"error": error});
			returnResOrCallback({"error": error}, res, callback);
			return console.log(error);
		}
		console.log("Successfully authenticated to dropbox");

		// TEXT: {binary: true } is for everything except text...
		client.readFile(folder+filename, { binary: true }, function(error, data) {
			if (error) {
				// res.json({"error": error});
				returnResOrCallback({"error": error}, res, callback);
				return console.log(error);  // Something went wrong.
			}
			console.log("readFile");

			var encoding = "binary";
			var error_msg = "";
			// TEXT: for text, use var encoding = "utf8";

			fs.writeFile('tmp/'+filename, data, {"encoding": encoding, "flag": "w"}, function(err){
				if (err) {
					// res.json({"error": "failed: fs.writeFile"});
					returnResOrCallback({"error": "failed: fs.writeFile"}, res, callback);
					return console.log(err);
				}

				console.log("write to local file done");

				// now access a cell
				try{
					error_msg = "Error thrown at: " + "xlsx.parse('tmp/'"+filename+")";
					var obj = xlsx.parse('tmp/'+filename); // parses a file 
				

					console.log("xlsx parse done");

					error_msg = "Error thrown at: " + "xlsx.parse(fs.readFileSync('tmp/'"+filename+"))";
					var obj2 = xlsx.parse(fs.readFileSync('tmp/'+filename)); // parses a buffer 

					// delete the temporary file
					fs.unlink('tmp/'+filename, function(state){
						console.log("deleted file");
						console.log(state);
					});

					// we can now parse obj2 to get each internal sheet and then the wanted cell
					// a priority for our client is to see if date is filled (sheet "Dados", row 4, cell next to "Data actual", then row 6, cell next to "Nome da Clinica")
					// res.json(obj2);
					returnResOrCallback(obj2, res, callback);

				} catch(err){
					console.log("err");
					console.log(err);

					// delete the temporary file (also on error state)
					fs.unlink('tmp/'+filename, function(state){
						console.log("deleted file");
						console.log(state);
					});

					// res.json({"error": err + "\n" + error_msg});
					returnResOrCallback({"error": err + "\n" + error_msg}, res, callback);
				}

			});

		});
	});
}
