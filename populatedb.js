#! /usr/bin/env node

console.log('This script populates the weekly matchups into the Matchup table');
var http = require('http');
var url = require('url');
var express = require('express');
const rp = require('request-promise');
const cheerio = require('cheerio');
var bodyParser = require('body-parser'); // Loads the piece of middleware for managing the settings
var session = require('cookie-session'); // Loads the piece of middleware for sessions
var fs = require('fs');
var path = require('path');
var compression = require('compression');
var helmet = require('helmet');
var mongoose = require('mongoose');

var async = require('async')
var Matchup = require('./models/matchup');

mongoose.connect("mongodb://repsteindev:Sodapop726@ds129762.mlab.com:29762/nfl_pickem", { useNewUrlParser: true } );
mongoose.Promise = global.Promise;
var db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));


var matchups = [];
var awaylist = [];
var homelist = [];
var numOfGames;
// change NFLWeek to store different week matchups in db
var NFLWeek = "1";
var NFLAbbrevs = {
	'Cardinals': 'ARZ',
	'Falcons': 'ATL',
	'Ravens': 'BAL',
	'Bills': 'BUF',
	'Panthers': 'CAR',
	'Bears': 'CHI',
	'Bengals': 'CIN',
	'Browns': 'CLE',
	'Cowboys': 'DAL',
	'Broncos': 'DEN',
	'Lions': 'DET',
	'Packers': 'GB ',
	'Texans': 'HOU',
	'Colts': 'IND',
	'Jaguars': 'JAX',
	'Chiefs': 'KC ',
	'Dolphins': 'MIA',
	'Vikings': 'MIN',
	'Patriots': 'NE ',
	'Saints': 'NO ',
	'Giants': 'NYG',
	'Jets': 'NYJ',
	'Raiders': 'OAK',
	'Eagles': 'PHI',
	'Steelers': 'PIT',
	'Chargers': 'LAC',
	'49ers': 'SF ',
	'Seahawks': 'SEA',
	'Rams': 'LAR',
	'Buccaneers': 'TB ',
	'Titans': 'TEN',
	'Redskins': 'WAS'
}


const options = {
	  uri: `http://www.nfl.com/schedules/2018/REG` + NFLWeek + ``,
	  transform: function (body) {
		return cheerio.load(body);
	  }
	};

	rp(options)
	  .then(($) => {
			$('.team-name.away').each(function(i, elem) {
				awaylist[i] = $(this).text();
			});  
			
			$('.team-name.home').each(function(i, elem) {
				homelist[i] = $(this).text();
			});  
			
			homelist.shift();
			awaylist.shift();
			
			numOfGames = homelist.length;
			
			for (var key in NFLAbbrevs){
				var re = new RegExp(key, 'gi');
				for (var i = 0; i < numOfGames; i++){
					homelist[i] = homelist[i].replace(re, NFLAbbrevs[key]); 
					awaylist[i] = awaylist[i].replace(re, NFLAbbrevs[key]);
				}
			}
				  
		function matchupCreate(awaylist, homelist, numOfGames, week, cb) {
		  matchupdetail = {awaylist:awaylist, homelist:homelist, numOfGames:numOfGames, week: week}
		  var matchup = new Matchup(matchupdetail);
			   
		  matchup.save(function (err) {
			if (err) {
				console.log(err);
			}
			matchups.push(matchup);
			
		  }  );
		}



		function createMatchups(cb) {
			async.parallel([
				function(callback) {
				  matchupCreate(awaylist, homelist, numOfGames, NFLWeek, callback);
				},
				],
				// optional callback
				cb);
		}



		async.series([
			createMatchups
		],
		// Optional callback
		function(err, results) {
			if (err) {
				console.log('FINAL ERR: '+err);
			}
			else {
				console.log('Matchups: '+matchups);
				
			}
			// All done, disconnect from database
			mongoose.connection.close();
		});




			
		})
	  .catch((err) => {
		console.log(err);
	  });

