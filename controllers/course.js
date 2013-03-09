module.exports = {
    list: function(req, res) {
      Course.find({}).exec(function(err, courses) {
        res.render('courses', {
          courses: courses
        });
      });
    }
  , creationForm: function(req, res) {
      res.render('course-create');
    }
  , create: function(req, res) {

      var course = new Course({
          name: req.param('name')
        , description: req.param('description')
        //, _creator: req.user._id
      });

      course.save(function(err) {
        res.redirect( '/courses/' + course._id);
      });

      // save to Git...
      console.log("creating a repo named "+course.name);
      var GitHubApi = require("github");
      var github = new GitHubApi({
        // required
        version: "3.0.0",
        // optional
        timeout: 5000
      });
      github.authenticate({
        type: "basic", // obviously, make OAuth happen here.
        username: 'coursefork-test',
        password: 'coursefork001'
      });

     // this block is for debugging
     //github.user.getFollowingFromUser({
        //user: "coursefork-test"
     //}, function(err, res) {
        //console.log(JSON.stringify(res));
     //});

      github.repos.create({
        "name": course.name,
        "description": course.description,
        "homepage": "https://github.com",
        "private": false,
        "has_wiki": true
      }, function(err, res) {
        console.log("Got err?", err);
        console.log("Got res?", res);
      })

  }
  , view: function(req, res, next) {
      Course.findOne({ _id: req.param('courseID') }).populate("_owner").exec(function(err, course) {
        if (!course) {
          next();
        } else {
          res.render('course', {
            course: course
          });
        }
      });
    }
 , fork: function(req, res, next) {
    console.log("Rawesome, look at me forking.");
 }
}
