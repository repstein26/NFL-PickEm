var Ticket = require('../models/ticket');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');



// Display list of all Tickets.
exports.ticket_list = function(req, res, next) {
	
    Ticket.find({'week': req.query.week})
    .sort([['_id', 'descending']])
    .exec(function (err, list_tickets) {
      if (err) { return next(err); }
      //Successful, so render	
		res.render('ticket_list.ejs', { title: 'Ticket List', ticket_list: list_tickets});
		
    });

};

// Handle Ticket delete on POST.
exports.ticket_delete_post = function(req, res) {
	var week = req.query.week;
    Ticket.findByIdAndRemove(req.body.ticketid, function deleteTicket(err) {
		if (err) { return next(err); }
		// Success - go to author list.
		res.redirect('/selection/tickets?week='+week);
	})
};


// Handle Ticket deleteALL on POST.
exports.ticket_deleteall_post = function(req, res) {
	var week_to_remove = req.query.week;
	Ticket.remove({ week : week_to_remove }, function (err) {
    if (err) { return next(err); }
		res.redirect('/selection/tickets?week='+week_to_remove);
	})
};
