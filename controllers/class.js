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
        var slide = thisClass.slides[ req.param('slideID') - 1 ];
        slide.id = req.param('slideID');

        res.render('slide', {
            thisClass: thisClass
          , slide: slide
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
  , create: function(req, res) {

      var thisClass = new Class({
          name: req.param('name')
        , description: req.param('description')
        , _creator: req.user._id
        , _owner: req.user._id
      });

      //var util = require("util"); // TODO: find out why this isn't working as described. Probably something simple...
      //var github = util.github(req.user.github.token)
      var GitHubApi = require("github");
      var github = new GitHubApi({
        // required
        version: "3.0.0"
        // optional
      , timeout: 5000
      });
      github.authenticate({
        //type: "oauth" // obviously, make OAuth happen here.
        //, token: req.user.github.token // we're assuming this is here for now.
        //Nulls? We don't handle no stinkin' nulls.
          type: "basic"
        , username: 'coursefork-test'
        , password: 'coursefork001'
      });

      thisClass.save(function(err) {
        // ok, we've saved (hopefully) to Mongo (or at least told Mongo to save; it writes asynchronously)
        // So now make something actually happen in Git-land
        console.log("creating a repo named "+thisClass.name);
        // this is where we create a new class
        var templateUser = "coursefork";
        var templateName = "course-template";
        github.repos.fork({
          "user": templateUser
          , "repo": templateName
        }, function(forkerr, forkres) {
          console.log("Got err?", forkerr);
          console.log("Got res?", forkres);
          github.repos.update({
              "user": "coursefork-test"//TODO: when github username isn't hardcoded: thisClass._owner.github.username
            , "repo": templateName
            , "name": thisClass.name
            , "description": thisClass.description
            , "homepage": "https://coursefork.org"
            , "private": false
            , "has_wiki": true
          })
          res.redirect( '/classes/' + thisClass._id);
        })
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
    Class.findOne({ _id: req.param('classID') }).populate("_owner").exec(function(err, thisClass) {

      //var util = require("util"); // sounded like a good idea...
      //var github = util.github(req.user.github.token)
      var GitHubApi = require("github");
      var github = new GitHubApi({
        // required
        version: "3.0.0"
        // optional
      , timeout: 5000
      });
      github.authenticate({
        //type: "oauth" // obviously, make OAuth happen here.
        //, token: req.user.github.token // we're assuming this is here for now.
        //Nulls? We don't handle no stinkin' nulls.
          type: "basic"
        , username: 'coursefork-test'
        , password: 'coursefork001'
      });

      console.log("So we have this class: ", thisClass.name);
      console.log("...with this owner: ", thisClass._owner.github.username);

      github.repos.fork({
          "user": "coursefork-test"//thisClass._owner.github.username
        , "repo": thisClass.name
      }, function(forkerr, forkres) {
        console.log("Oh fork:", forkerr);
        if (forkres) {
          // this is where we create a new class
          console.log("forkin' A", forkres);
          // This is for importing a repo that already exists in Github.
          var newClass = new Class({
              name: thisClass.name
            , description: thisClass.description
            , creator: thisClass._creator
            , _owner: thisClass._owner
          });
          thisClass.save(function(err) {
            if (err) {
               console.log("Error!!!!");
               console.log(err);
            }
            res.redirect( '/classes/' + newClass._id);
          });
        } else {
          res.redirect("/error");//...or something. Whatever.
        }
      });
      //TODO: redirect to a "we're forking" page, then put handlers in the fork callback to redir to success or error page.
   });
 }
}
