/**
 * Basic Skills object copied from the Alexa Skills Kit developer documentation:
 * https://developer.amazon.com/appsandservices/solutions/alexa/alexa-skills-kit/getting-started-guide
 *
 * @author: Chris Moyer <cmoyer@newstex.com>
 */
'use strict';

/**
 * Create a new ASK Skill
 * @param options:
 * 	:appId: Optional, restrict to a specifick Application ID to prevent any other executions
 * 	:welcomeText: The text to send as a "Welcome"
 * 	:repromptText: The "reprompt" short test to respond with if we don't understand what they said
 * @param handlers: A map of Intent handlers
 */
function Skill(options, handlers){
	this.options = options;
	this.handlers = handlers;
}

// --------------- Helpers that build all of the responses -----------------------

Skill.buildSpeechletResponse = function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
	return {
		outputSpeech: {
			type: 'PlainText',
			text: output,
		},
		card: {
			type: 'Simple',
			title: title,
			content: output,
		},
		reprompt: {
			outputSpeech: {
				type: 'PlainText',
				text: repromptText,
			}
		},
		shouldEndSession: shouldEndSession,
	};
};
Skill.buildResponse = function buildResponse(sessionAttributes, speechletResponse) {
	return {
		version: '1.0',
		sessionAttributes: sessionAttributes,
		response: speechletResponse,
	};
};

/**
 * Called when the session starts.
 */
Skill.prototype.onSessionStarted = function onSessionStarted(sessionStartedRequest, session) {
	console.log('onSessionStarted requestId=' + sessionStartedRequest.requestId +
				', sessionId=' + session.sessionId);
};

/**
 * Called when the user launches the skill without specifying what they want.
 */
Skill.prototype.onLaunch = function onLaunch(launchRequest, session, callback) {
	console.log('onLaunch requestId=' + launchRequest.requestId +
				', sessionId=' + session.sessionId);

	// Dispatch to your skill's launch.
	this.getWelcomeResponse(callback);
};

/**
 * Called when the user specifies an intent for this skill.
 */
Skill.prototype.onIntent = function onIntent(intentRequest, session, callback) {
	var intent = intentRequest.intent,
		intentName = intentRequest.intent.name;

	console.log('onIntent requestId=' + intentRequest.requestId +
				', sessionId=' + session.sessionId +
				', name=' + intentName);

	// Map to Skill Intents
	if(this.handlers[intentName]){
		this.handlers[intentName](intent, session, callback);
	} else if ('HelpIntent' === intentName) {
		// Help Intent is provided by default
		this.getWelcomeResponse(callback);
	} else {
		throw 'Invalid Intent';
	}
};

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
Skill.prototype.onSessionEnded = function onSessionEnded(sessionEndedRequest, session) {
	console.log('onSessionEnded requestId=' + sessionEndedRequest.requestId +
		', sessionId=' + session.sessionId);
	// Add cleanup logic here
};

// --------------- Functions that control the skill's behavior -----------------------

Skill.prototype.getWelcomeResponse = function getWelcomeResponse(callback) {
	// If we wanted to initialize the session to have some attributes we could add those here.
	var sessionAttributes = {};
	var cardTitle = 'Welcome';
	var speechOutput = this.options.welcomeText;
	// If the user either does not reply to the welcome message or says something that is not
	// understood, they will be prompted again with this text.
	var repromptText = this.options.repromptText;
	var shouldEndSession = false;

	callback(sessionAttributes,
		Skill.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
};

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
Skill.prototype.handler = function (event, context) {
	console.log('Skill:', this);
	var self = this;
	try {
		console.log('event.session.application.applicationId=' + event.session.application.applicationId);

		/**
		 * Uncomment this if statement and populate with your skill's application ID to
		 * prevent someone else from configuring a skill that sends requests to this function.
		 */
		if (self.appId && event.session.application.applicationId !== 'amzn1.echo-sdk-ams.app.' + self.appId) {
			context.fail('Invalid Application ID');
		}

		if (event.session.new) {
			self.onSessionStarted({requestId: event.request.requestId}, event.session);
		}

		if (event.request.type === 'LaunchRequest') {
			self.onLaunch(event.request,
				event.session,
				function callback(sessionAttributes, speechletResponse) {
					context.succeed(Skill.buildResponse(sessionAttributes, speechletResponse));
				});
		} else if (event.request.type === 'IntentRequest') {
			self.onIntent(event.request,
				event.session,
				function callback(sessionAttributes, speechletResponse) {
					context.succeed(Skill.buildResponse(sessionAttributes, speechletResponse));
				});
		} else if (event.request.type === 'SessionEndedRequest') {
			self.onSessionEnded(event.request, event.session);
			context.succeed();
		}
	} catch (e) {
		context.fail('Exception: ' + e);
	}
};

module.exports = Skill;
