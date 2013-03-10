/* This file is a config, that exposes various
   meaningful values to the rest of the application.
   This is done using the module.exports function,
   which sets them when require('./thisfile') is run. */

module.exports = {
    appPort: 9200
  , appURL: "http://localhost" // set this to the public address of your app
  , cookieSecret: 'this can be any random string, you can even use this one. :)'
  , databaseName: 'forkshop'
  , github: {
        clientID: 'da1eb6b57ba9304a33f3'
      , clientSecret: 'e231370caa92768418b03d6a4330b29c2bd0b139'
    }
};
