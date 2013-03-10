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
  //TODO: WTF is in scope here?  How do I get a hold of whatever is on this class object?
  //Good grief, I'm flying blind here...
  var exec = require('child_process').exec;
  //var username = this._owner.github.username;//TODO: the right way, but we're not saving w/ the correct username yet.
  var username = 'coursefork-test';
  var password = 'coursefork001';
  var dirname = "/tmp/forkshop/"+username+"/"+this.name;
  var reponame = this.name;
  //TODO: this is node, of course, so this is going to be async. We need to make something in here synchronous.  Good luck w/ that.
  child = exec("rm -rf "+dirname, function (error, stdout, stderr) {
    console.log('stdout for rm: ' + stdout);
    console.log('stderr for rm: ' + stderr);
    exec('git clone https://'+username+':'+password+'@github.com/'+username+'/'+reponame+'.git '+dirname, function(error, stdout, stderr) {
        console.log("Cloned!");
        console.log('stdout for clone: ' + stdout);
        console.log('stderr for clone: ' + stderr);

        if (error !== null) {
          console.log('error while cloning: ' + error);
        }
        // ok, we have cloned it. Now let's see what's in the "slides" directory.
        var fs = require('fs');
        fs.readdir(dirname+"/slides", function(err, files) {
            if (err  !== null) {
              console.log("error getting slide names from cloned dir: "+err);
            }

            if (files !== null) {
              return files.map(function(a) {
                  var map ={ name: a, content: fs.readFileSync(dirname+"/slides/"+a) }
                  console.log("!! returning "+ JSON.stringify(map));
                  return map;//TODO: ok, how do we actually return a value here?  We're all async. WTF, Node?
              })
            } else {
              return [];// return an empty array
            }
        });
    });
    console.log("child is "+ child);
    return child;
  });
  // TODO: GET THIS FROM GITHUB!!!
  // alternatively, store / track it when we create it?
  //return [
      //{ name: 'Introduction', content: 'foo' }
    //, { name: 'Why?',         content: 'foo' }
    //, { name: 'Solution',     content: 'foo' }
    //, { name: 'Questions?',   content: 'foo' }
  //];
});

// attach the passport fields to the model
ClassSchema.plugin(passportLocalMongoose);

var Class = mongoose.model('Class', ClassSchema);

// export the model to anything requiring it.
module.exports = {
  Class: Class
};
