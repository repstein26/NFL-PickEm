var Matchup = require('../models/matchup');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');


// Display list of matchups for specified week
exports.matchup_list = function(req, res, next) {
    Matchup.find({'week': req.query.week})
    .exec(function (err, list_matchups) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('pickem.ejs', { title: 'Matchup List', week: req.query.week, matchuplist: list_matchups});
    });

};