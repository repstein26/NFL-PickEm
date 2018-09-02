var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var TicketSchema = new Schema(
  {
    tickets: {type: String, required: true, unique:true},
    week: {type: String, required: true},
	comment: {type: String, required: true}
  }
);

// Virtual for ticket's URL
TicketSchema
.virtual('url')
.get(function () {
  return '/selection/ticket/' + this._id;
});

TicketSchema.pre("save", true, function(next, done) {
    var self = this;
    mongoose.models["Ticket"].findOne({tickets: self.tickets}, function(err, ticket) {
        if(err) {
            done(err);
        } else if(ticket) {
            self.invalidate("ticket", "tickets must be unique");
            return err;
        } else {
            done();
        }
    });
    next();
});

//Export model
module.exports = mongoose.model('Ticket', TicketSchema);