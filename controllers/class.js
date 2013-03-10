module.exports = {
    list: function(req, res) {
      Class.find({}).exec(function(err, classes) {
        res.render('classes', {
          classes: classes
        });
      });
    }
  , creationForm: function(req, res) {
      res.render('class-create');
    }
  , repoImport: function(req, res) {
      // This is for importing a repo that already exists in Github.
      var class = new Class({
          name: req.param('className')
        , description: req.param('description')
        //, _creator: req.user._id
      });

      class.save(function(err) {
        res.redirect( '/classes/' + class._id);
      });

    }
  , create: function(req, res) {

      var class = new Class({
          name: req.param('name')
        , description: req.param('description')
        //, _creator: req.user._id
      });

      class.save(function(err) {
        res.redirect( '/classes/' + class._id);
      });

      // save to Git...
      console.log("creating a repo named "+class.name);

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
     //  user: "classfork-test"
     //}, function(err, res) {
     //  console.log(JSON.stringify(res));
     //});

      github.repos.create({
        "name": class.name,
        "description": class.description,
        "homepage": "https://github.com",
        "private": false,
        "has_wiki": true
      }, function(err, res) {
        console.log("Got err?", err);
        console.log("Got res?", res);
      })

  }
  , view: function(req, res, next) {
      Class.findOne({ _id: req.param('classID') }).populate("_owner").exec(function(err, class) {
        if (!class) {
          next();
        } else {
          res.render('class', {
            class: class
          });
        }
      });
    }
 , fork: function(req, res, next) {
    console.log("Rawesome, look at me forking class "+ className+" and owner "+ classOwnerName);
    var className = req.param('className')
    var classOwnerName = req.param('classOwner')
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
        , username: 'classfork-test'
        , password: 'classfork001'
    });

    // this block is for debugging
    //github.user.getFollowingFromUser({
    //  user: "classfork-test"
    //}, function(err, res) {
    //  console.log(JSON.stringify(res));
    //});
    console.log("So we have this class: ", className);
    console.log("...with this owner: ", classOwnerName);

    github.repos.fork({
        "user": classOwnerName
      , "repo": className
    }, function(forkerr, forkres) {
      console.log("Oh fork:", forkerr);
      if (forkres) {
        // this is where we create a new class
        console.log("forkin' A", forkres);
        res.redirect("/class/import/"+className);
      } else {
        res.redirect("/error");//...or something. Whatever.
      }
    });
    //TODO: redirect to a "we're forking" page, then put handlers in the fork callback to redir to success or error page.

 }
}
