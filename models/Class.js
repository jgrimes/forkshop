var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = mongoose.SchemaTypes.ObjectId
  , passportLocalMongoose = require('passport-local-mongoose');

// this defines the fields associated with the model,
// and moreover, their type.
var ClassSchema = new Schema({
    name: { type: String }
  , description: { type: String }
  , _creator: { type: ObjectId, ref: 'User' }
  , _owner: { type: ObjectId, ref: 'User' }
});

// This could be so cool...instead of having this hardcoded model, we could just look at the directories and dynamically render
// whatever we have in the top-level directories, based on rendering instructions within the directories themselves...
// But alas, it's not going to happen right away.
//
ClassSchema.virtual('slides').get(function () {
  // TODO: GET THIS FROM GITHUB!!!
  // alternatively, store / track it when we create it?
  return [ 
      { name: 'Introduction',         content: 'foo' }
    , { name: 'What\'s the problem?', content: 'foo' }
    , { name: 'Teaching',             content: 'foo' }
    , { name: 'Collaboration',   content: 'foo' }
    , { name: 'The Solution',   content: 'foo' }
    , { name: 'Open Source',   content: 'foo' }
    , { name: 'RedHat',   content: 'foo' }
    , { name: 'GitHub',   content: 'foo' }
    , { name: 'Questions?',   content: 'foo' }
  ];
});

// attach the passport fields to the model
ClassSchema.plugin(passportLocalMongoose);

var Class = mongoose.model('Class', ClassSchema);

// export the model to anything requiring it.
module.exports = {
  Class: Class
};
