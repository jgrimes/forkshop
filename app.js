var express = require('express')
  , app = express()
  , mongoose = require('mongoose')
  , flash = require('connect-flash')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , GitHubStrategy = require('passport-github').Strategy
  , config = require('./config')
  , database = require('./db')
  , RedisStore = require('connect-redis')(express)
  , sessionStore = new RedisStore({ client: database.client });

var courses = require('./controllers/course');

/* Models represent the data your application keeps. */
/* You'll need at least the User model if you want to 
	allow users to login */
User      = require('./models/User').User;
Course    = require('./models/Course').Course;
//Thing   = require('./models/Thing').Thing;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

//passport.use(new LocalStrategy( User.authenticate() ) );
passport.use(new GitHubStrategy({
    clientID: config.github.clientID,
    clientSecret: config.github.clientSecret,
    callbackURL: '/auth/github/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);

    User.findOne({ 'github.id': profile.id }, function(err, user) {
      if (!user) {
        var user = new User({
            username: profile.username
          , email: profile.emails[0].value
          , github: {
                id: profile.id
              , username: profile.username
              , token: accessToken
              , refreshToken: refreshToken
            }
        });
      }

      user.email                = profile.emails[0].value;
      user.username             = profile.username;
      user.github.token         = accessToken;
      user.github.refreshToken  = refreshToken;

      user.save(function(err) {
        return done(err, user);
      });
    });
  }
));

// make the HTML output readible, for designers. :)
app.locals.pretty = true;

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'keyboard cat' }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(__dirname + '/public'));

/* app.use(function(req, res, next) {
  app.locals.user = req.user;
  next();
}); */

/* Configure "routes".
    "routes" are the mappings your browser/client use to 
    access the logic behind a concept.  Google "REST" to
    learn more about the principle. */

/* the first route we'll configure is our front page. :) */
/* this means: when a GET request is issued to (yourapp)/,
    ...execute a function with the [req]uest, [res]ponse, and
    the [next] function. */
app.get('/', function(req, res) {

  /* in this function, render the index template, 
     using the [res]ponse. */

  if (req.user) {
    Course.find({ _owner: req.user._id }).exec(function(err, courses) {
      res.render('home', {
          user: req.user
        , courses: courses
      });
    });
  } else {

    res.render('index', {
      user: req.user,
      foo: 'bar' //this is an example variable to be sent to the rendering engine
    });
  }

});

app.get('/register', function(req, res) {
  res.render('register');
});

app.get('/login', function(req, res) {
  res.render('login');
});

app.get('/about', function(req, res) {
  res.render('about');
});

/* when a POST request is made to '/register'... */
app.post('/register', function(req, res) {
  User.register(new User({ email : req.body.email, username : req.body.username }), req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      return res.render('register', { user : user });
    }

    res.redirect('/');
  });
});

app.post('/login', passport.authenticate('local', {
  failureRedirect: '/'
}), function(req, res) {
  res.redirect('/');
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/courses', courses.list);
app.get('/courses/new', courses.creationForm);
app.post('/courses', courses.create);
app.get('/courses/:courseID', courses.view);

app.listen( config.appPort , function() {
  console.log('Demo application is now listening on http://localhost:' + config.appPort + ' ...');
});
