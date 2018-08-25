var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var MatchupSchema = new Schema(
  {
	awaylist: {type: String, required: true},
	homelist: {type: String, required: true},
	numOfGames: {type: String, required: true},
    week: {type: String, required: true}
  }
);

// Virtual for ticket's URL
MatchupSchema
.virtual('url')
.get(function () {
  return '/selection/matchup/' + this._id;
});

//Export model
module.exports = mongoose.model('Matchup', MatchupSchema);