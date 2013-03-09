/* This file is a config, that exposes various
   meaningful values to the rest of the application.
   This is done using the module.exports function,
   which sets them when require('./thisfile') is run. */

module.exports = {
    appPort: 9200
  , callbackURL: "http://forkshop.ericmartindale.com" // set this to the public address of your app
  , cookieSecret: 'this can be any random string, you can even use this one. :)'
  , databaseName: 'forkshop'
  , github: {
        clientID: '033d055c9fb974924671'
      , clientSecret: '1b5a416c77d27101e42dc6db3a17a14b9948148c'
    }
};