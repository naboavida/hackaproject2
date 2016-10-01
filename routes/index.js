
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index');
};

exports.partials = function (req, res) {
  var name = req.params.name;
  res.render('partials/' + name);
};

exports.project = function (req, res) {
  var name = req.params.name;
  res.render('project/' + name);
};

// exports.dashboard = function (req, res) {
// 	res.render('dashboard');
// };

// exports.projects = function (req, res) {
// 	res.render('projects');
// };

exports.addProject = function (req, res) {
	res.render('addProject');
};


// exports.addWidget = function (req, res) {
// 	res.render('addWidget');
// };
