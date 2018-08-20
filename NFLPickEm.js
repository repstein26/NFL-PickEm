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

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var awayList = new Array();
var homeList = new Array();
var homeProb = new Array();
var awayProb = new Array();
var winners = new Array();
var numOfGames = 0;
var app = express();
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;

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
app.use(helmet());
app.use(express.static(__dirname + '/views/img/'));


app.get('/', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('Please browse to http://localhost:8080/weekX/ where X is the NFL Week number \n(i.e. http://localhost:8080/week1/)');
});

app.get('/week:NFLWeek', function(req, res) {
	NFLWeek = req.params.NFLWeek;
	
	const options = {
	  uri: `http://www.nfl.com/schedules/2018/REG` + NFLWeek + ``,
	  transform: function (body) {
		return cheerio.load(body);
	  }
	};

	rp(options)
	  .then(($) => {
			$('.team-name.away').each(function(i, elem) {
				awayList[i] = $(this).text();
			});  
			
			$('.team-name.home').each(function(i, elem) {
				homeList[i] = $(this).text();
			});  
			
			numOfGames = homeList.length;
			
			res.render('pickem.ejs', {week: req.params.NFLWeek, awayTeams: awayList, homeTeams: homeList});
		})
	  .catch((err) => {
		console.log(err);
	  });
	  
    
});


app.post('/results', function(req, res) {
	numOfGames = homeList.length;
    var homeProbability;
	var awayProbability;
	var filename;
	var winningTeamStringBuilder = "";
	
	for (var a = 0; a < 50; a++){
		for (var i = 1; i < numOfGames; i++){
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
		winningTeamStringBuilder = winningTeamStringBuilder + "\r\n";
	}
	
	for (var key in NFLAbbrevs){
			var re = new RegExp(key, 'gi');
			winningTeamStringBuilder = winningTeamStringBuilder.replace(re, NFLAbbrevs[key]); 
	}
	
	res.setHeader('Content-disposition', 'attachment; filename=winningTickets.txt');
	res.set('Content-Type', 'text/plain');
	res.status(200).send(winningTeamStringBuilder);
	winningTeamStringBuilder = "";
	res.end("");
    //res.redirect('/week' + NFLWeek);
});




app.listen(port);

function onErr(err) {
    console.log(err);
    return 1;
} 

function generateRand(){
	return Math.floor((Math.random()* 100) + 1);
}	
