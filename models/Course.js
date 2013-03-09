var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = mongoose.SchemaTypes.ObjectId
  , passportLocalMongoose = require('passport-local-mongoose');

// this defines the fields associated with the model,
// and moreover, their type.
var CourseSchema = new Schema({
    name: { type: String }
  , description: { type: String }
  , _creator: { type: ObjectId, ref: 'User' }
  , _owner: { type: ObjectId, ref: 'User' }
});

// attach the passport fields to the model
CourseSchema.plugin(passportLocalMongoose);

var Course = mongoose.model('Course', CourseSchema);

// export the model to anything requiring it.
module.exports = {
  Course: Course
};