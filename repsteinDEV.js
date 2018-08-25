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
var Ticket = require('./models/ticket');
var selection = require('./routes/selection');

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var awayList = new Array();
var homeList = new Array();
var homeProb = new Array();
var awayProb = new Array();
var winners = new Array();
var numOfGames = 0;
var app = express();
app.use(helmet());
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;



//Set up default mongoose connection
var dev_db_url = 'mongodb://repsteindev:Sodapop726@ds129762.mlab.com:29762/nfl_pickem';
var mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB);
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));



var NFLweek = "";
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


app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use(compression()); //Compress all routes


app.use('/selection', selection);

//app.use(express.static(__dirname + '/views/img/'));
app.use(express.static('public'));

app.get('/', function(req, res) {
   // res.setHeader('Content-Type', 'text/plain');
   // res.end('Please browse to http://localhost:8080/weekX/ where X is the NFL Week number \n(i.e. http://localhost:8080/week1/)');
   res.render('index.ejs', {});
});

//temporary to be removed
app.get('/ticket_list', function(req, res) {
	var myJSON = JSON.stringify(NFLAbbrevs);
	res.render('ticket_list.ejs', {ticketlist: myJSON, test: "test"} );
});


app.get('/selection', function(req, res) {
	res.render('selection.ejs', {});
});

app.get('/week', function(req, res) {
	res.render('pickemMain.ejs', {});
});

app.post('/weekpicker', function(req, res){
	var weeknum = req.body.week;
	weeknum = weeknum.replace('Week ','');
	res.redirect('/selection?week='+weeknum);
});

app.get('/selection/week:NFLWeek', function(req, res) {
	NFLWeek = req.params.NFLWeek;
	res.redirect(307, '/selection/matchup?week='+NFLWeek+'');
});

app.post('/selection/deleteticket', function(req, res) {
	res.redirect(307, '/selection/ticket/'+req.body.ticketid+'/delete?week='+req.body.week);
	
});

app.post('/selection/deleteall', function(req, res) {
	res.redirect(307, '/selection/ticket/deleteall?week='+req.body.week);
	
});

app.post('/selection/results', function(req, res) {
	numOfGames = req.body.numOfGames;
    var homeProbability;
	var awayProbability;
	var winningTeamStringBuilder = "";
	var numOfTickets = req.body.numOfTix;
	var week = req.body.week;
	var arrayOfTickets = new Array();
	
	awayList = req.body.awayList.split(",");
	homeList = req.body.homeList.split(",");
	
	for (var a = 0; a < numOfTickets; a++){
		for (var i = 0; i < numOfGames; i++){
			homeProbability = "homeProb"+i;
			awayProbability = "awayProb"+i;
			homeProb[i] = req.body[homeProbability];
			awayProb[i] = req.body[awayProbability];
			var rand = generateRand();
			if (rand <= homeProb[i]){
				winners[i] = homeList[i];
			} else {
				winners[i] = awayList[i];
			}
			winningTeamStringBuilder = winningTeamStringBuilder + " " + winners[i];
		}
		if ( !( winningTeamStringBuilder in arrayOfTickets ) ) {
			arrayOfTickets[a] = winningTeamStringBuilder;
			var t = new Ticket({
				tickets: winningTeamStringBuilder,
				week: week
			});
			winningTeamStringBuilder = "";
			t.save(function(err) {
			if (err)
			   throw err;
			});
		
		} else {
			console.log("Duplicate ticket stopped from being added");
		}
		
		
	} 
	setTimeout(function (){
		res.redirect('/selection/tickets?week='+week);
	}, 1000);
	
});




app.listen(port);

function onErr(err) {
    console.log(err);
    return 1;
} 

function generateRand(){
	return Math.floor((Math.random()* 100) + 1);
}	

module.exports = app;