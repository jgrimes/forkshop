module.exports = {
    github = function(token) {
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

      return github;
    }
}
