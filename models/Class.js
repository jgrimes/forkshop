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

// attach the passport fields to the model
ClassSchema.plugin(passportLocalMongoose);

var Class = mongoose.model('Class', ClassSchema);

// export the model to anything requiring it.
module.exports = {
  Class: Class
};