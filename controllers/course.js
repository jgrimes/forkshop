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

    }
  , view: function(req, res, next) {
      Course.findOne({ _id: req.param('courseID') }).exec(function(err, course) {
        if (!course) {
          next();
        } else {
          res.render('course', {
            course: course
          });
        }
      });
    }
}