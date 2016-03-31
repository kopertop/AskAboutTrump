/**
 * "Ask Trump" Skill.
 *
 * Ask "The Donald" or "Trump" a question.
 */
'use strict';

var Skill = require('./lib/skill');
var Algolia = require('algoliasearch');
var algoliaConnection = new Algolia(conf.ALGOLIA.app_id, conf.ALGOLIA.key);
var index = algoliaConnection.initIndex('trump');

function askQuestion(intent, session, callback) {
	var repromptText = 'Go on, ask';
	var sessionAttributes = {};
	var speechOutput = 'I will make america great again! Ask me how.';
	var closeSession = false;
	var question = intent.slots.Question;
	if(question && question.value){
		question = question.value;
	}
	console.log('SEARCHING FOR', question);
	index.search(question, { hitsPerPage: 1 }, function(err, resp){
		var title = question.value;
		if(!err && resp && resp.hits && resp.hits.length > 0){
			console.log('ALGOLIA RESPONSE', resp.hits);
			closeSession = true;
			speechOutput = resp.hits[0].response;
			title = resp.hits[0].name;
		}

		// Setting repromptText to null signifies that we do not want to reprompt the user.
		// If the user does not respond or says something that is not understood, the session
		// will end.
		callback(sessionAttributes,
				Skill.buildSpeechletResponse(title, speechOutput, repromptText, closeSession));
	});
}

/**
 * Get a random quote
 */
var random_quotes = [
	'Lets make America Great Again!',
	'Sometimes your best investments are the ones you don\'t make.',
	'Sometimes by losing a battle you find a new way to win the war.',
	'I try to learn from the past, but I plan for the future by focusing exclusively on the present. That\'s were the fun is.',
];
function getQuote(intent, session, callback){
	var randInt = Math.round(Math.random()*100)%random_quotes.length;
	console.log('RETURN RANDOM QUOTE', randInt);
	callback({},
			Skill.buildSpeechletResponse('Random Quote', random_quotes[randInt], null, true));
}

function helpIntent(intent, session, callback){
	callback({},
			Skill.buildSpeechletResponse('Help', 'Try asking me a question like "What do you think about china"', 'Sorry, try rephrasing your question', false));
}

function stop(intent, session, callback){
	callback({},
			Skill.buildSpeechletResponse('Goodbye', 'Goodbye', null, true));
}

var skill = new Skill({
	welcomeText: 'What would you like to ask Donald Trump?',
	repromptText: 'Sorry, I didn\'t catch that',
}, {
	AskQuestion: askQuestion,
	GetQuote: getQuote,
	'AMAZON.HelpIntent': helpIntent,
	'AMAZON.StopIntent': stop,
	'AMAZON.CancelIntent': stop,
});

// Something is broken with how Lambda calls this handler function,
// so we can't just directly link exports.handler to skill.handler, because
// it doesn't call it with the right context.
exports.handler = function handleLambdaRequest(event, context) {
	skill.handler(event, context);
};

