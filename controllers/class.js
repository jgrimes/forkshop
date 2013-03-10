module.exports = {
    list: function(req, res) {
      Class.find({}).exec(function(err, classes) {
        res.render('classes', {
          classes: classes
        });
      });
    }
  , listByCourse: function(req, res) {
      Course.findOne({ _id: req.param('courseID') }).exec(function(err, course) {
        Class.find({ _id: { $in: course.classes.map(function(courseClass) {
          return courseClass._class;
        })  }}).exec(function(err, classes) {

          res.render('classes', {
              course: course
            , classes: classes
          });
        });
      });
    }
  , creationForm: function(req, res) {
      res.render('class-create');
    }
  , showSlides: function(req, res) {
      Class.findOne({ _id: req.param('classID') }).exec(function(err, thisClass) {
        res.render('slides', {
            thisClass: thisClass
          , slides: thisClass.slides
        });
      });
    }
  , showSlide: function(req, res) {
      Class.findOne({ _id: req.param('classID') }).exec(function(err, thisClass) {
        res.render('slide', {
            thisClass: thisClass
          , slide: thisClass.slides[ req.param('slideID') - 1 ]
        });
      });
    }
  , createSlideForm: function(req, res) {
      Class.findOne({ _id: req.param('classID') }).exec(function(err, thisClass) {
        res.render('slide-create', {
            thisClass: thisClass
          , slide: { name: '', content: '## Slide One\nYour first awesome slide.' } // empty slide (or template!)
        });
      });
    }
  , createSlide: function(req, res) {
      Class.findOne({ _id: req.param('classID') }).exec(function(err, thisClass) {

        // TODO: create file in github here!
        var gitObject = { name: 'dummy slide', foo: 'bar' };

        thisClass.slides.push( gitObject );

        thisClass.save(function(err) {
          res.redirect('/classes/'+thisClass._id+'/slides');
        });
      });
    }
  , editSlideForm: function(req, res) {
      Class.findOne({ _id: req.param('classID') }).exec(function(err, thisClass) {
        res.render('slide-edit', {
            thisClass: thisClass
          , slide: thisClass.slides[ req.param('slideID') - 1 ] // TODO: get this from the slides!
        });
      });
    }
  , editSlide: function(req, res) {
      Class.findOne({ _id: req.param('classID') }).exec(function(err, thisClass) {
        // TODO: modify file!
        res.redirect('/classes/'+thisClass._id+'/slides');
      });
    }
  , repoImport: function(req, res) {
      // This is for importing a repo that already exists in Github.
      var thisClass = new Class({
          name: req.param('className')
        , description: req.param('description')
        , _creator: req.user._id
        , _owner: req.user._id
      });

      thisClass.save(function(err) {
        res.redirect( '/classes/' + thisClass._id);
      });

    }

  , create: function(req, res) {

      var thisClass = new Class({
          name: req.param('name')
        , description: req.param('description')
        , _creator: req.user._id
        , _owner: req.user._id
      });

      var util = require("./util");
      var github = util.github(req.user.github.token)
      thisClass.save(function(err) {
        // save to Git...
        console.log("creating a repo named "+thisClass.name);

        github.repos.fork({
            "user": courseOwnerName
          , "repo": courseName
        }, function(forkerr, forkres) {
          console.log("Creating a new fork:", forkerr);
          if (forkres) {
            // this is where we create a new class
            console.log("forkin' A", forkres);
              var templateUser = "coursefork";
              var templateName = "course-template";
              github.repos.fork({
                  "user": templateUser
                , "repo": templateName
              }, function(err, res) {
                console.log("Got err?", err);
                console.log("Got res?", res);
                github.repos.update({
                    "user": thisClass._owner.github.username
                  , "repo": templateName
                  , "name": thisClass.name
                  , "description": thisClass.description
                  , "homepage": "https://coursefork.org"
                  , "private": false
                  , "has_wiki": true
                })
                res.redirect( '/courses/' + thisClass._id);
              })
          } else {
            res.redirect("/error");//...or something. Whatever.
          }
        });
     });
  }
  , view: function(req, res, next) {
      Class.findOne({ _id: req.param('classID') }).populate("_owner").exec(function(err, thisClass) {
        res.render('class', {
          thisClass: thisClass
        });
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
