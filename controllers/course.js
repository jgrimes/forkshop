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
  , repoImport: function(req, res) {
      // This is for importing a repo that already exists in Github.
      var course = new Course({
          name: req.param('courseName')
        , description: req.param('description')
        //, _creator: req.user._id
      });

      course.save(function(err) {
        res.redirect( '/courses/' + course._id);
      });

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
        version: "3.0.0"
        // optional
      , timeout: 5000
      });
      github.authenticate({
        //type: "oauth" // obviously, make OAuth happen here.
        //, token: req.user.github.token // we're assuming this is here for now. Nulls? We don't handle no stinkin' nulls.
          type: "basic"
        , username: 'coursefork-test'
        , password: 'coursefork001'
      });

     // this block is for debugging
     //github.user.getFollowingFromUser({
     //  user: "coursefork-test"
     //}, function(err, res) {
     //  console.log(JSON.stringify(res));
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
    console.log("Rawesome, look at me forking course "+ courseName+" and owner "+ courseOwnerName);
    var courseName = req.param('courseName')
    var courseOwnerName = req.param('courseOwner')
    // Holy copy-n-paste!  Crappy code!
    var GitHubApi = require("github");
    var github = new GitHubApi({
        // required
        version: "3.0.0",
        // optional
        timeout: 5000
    });
    github.authenticate({
        //type: "oauth" // obviously, make OAuth happen here.
        //, token: req.user.github.token // we're assuming this is here for now. Nulls? We don't handle no stinkin' nulls.
          type: "basic"
        , username: 'coursefork-test'
        , password: 'coursefork001'
    });

    // this block is for debugging
    //github.user.getFollowingFromUser({
    //  user: "coursefork-test"
    //}, function(err, res) {
    //  console.log(JSON.stringify(res));
    //});
    console.log("So we have this course: ", courseName);
    console.log("...with this owner: ", courseOwnerName);

    github.repos.fork({
        "user": courseOwnerName
      , "repo": courseName
    }, function(forkerr, forkres) {
      console.log("Oh fork:", forkerr);
      if (forkres) {
        // this is where we create a new course
        console.log("forkin' A", forkres);
        res.redirect("/course/import/"+courseName);
      } else {
        res.redirect("/error");//...or something. Whatever.
      }
    });
    //TODO: redirect to a "we're forking" page, then put handlers in the fork callback to redir to the forked repo on soccess, or an error page on...well, you know.

 }
}
