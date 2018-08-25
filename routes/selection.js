var express = require('express');
var router = express.Router();

// Require controller modules.
var ticket_controller = require('../controllers/ticketController');
var matchup_controller = require('../controllers/matchupController');


/// TICKET ROUTES ///
// POST request to delete Ticket.
router.post('/ticket/:id/delete', ticket_controller.ticket_delete_post);

// POST request to delete ALL Ticket.
router.post('/ticket/deleteall', ticket_controller.ticket_deleteall_post);

// GET request for list of all Tickets.
router.get('/tickets', ticket_controller.ticket_list);

// GET request for list of weekly matchup.
router.get('/matchup', matchup_controller.matchup_list);


module.exports = router;