# Alexa ASK Intent Validator

The Alexa ASK Intent Validator is designed to help validate your Alexa interaction models.  Need to quickly try many different combinations of your utterances ON your devices, this is the tool for you.  While intended for medium-complex models, it can work on ANY interaction models.  

## How it Works

The intent validator is a lambda function that simply interprets the received event request from Alexa and states the key pieces of information (intent and slots) back to the user and displays in the card.

To use, simply take the code and deploy as a lambda function (in US East - Virginia). On your skill's configuration's Service Endpoint Type, ensure AWS Lambda ARN is selected, and paste the ARN ID into the form.

There are two ways to utilize – issuing a launch request (ie “open”) will have the skill will remain in dialog mode – one can continuously tell it different utterances until you say “exit”.  OneShot is also supported – ie “Ask SkillName to do this utterance” and the Alexa session ends afterwards.

*Note* if utilizing the dialog management features, you may need to include the source of the alexa-sdk in your lambda function.  You can complete this by performing "npm install" and including node_modules with your Lambda source.

## Dialog Management

Dialog Management is supported through the following code snippets:

~~~
// UPDATEME: Does your skill use Dialog Directives?  If so, update this to true.
const DIALOG_DIRECTIVE_SUPPORT = false;

if (DIALOG_DIRECTIVE_SUPPORT && request.dialogState && request.dialogState !== 'COMPLETED') {
    this.emit(':delegate');
} 
~~~
By setting the above flag to "true", the code will inspect the inbound request for the dialogState and if the dialogState is NOT "COMPLETED", it will always delegate back to the skill for additional prompts.  This works great for intents with confirmation/elicitation built-in, but for other intents this will break.  Thus, we recommend only turning this flag on for specifically testing your dialog directives and turn off when not.

## Language Support

English, German, French, Italian and Spanish languages are supported.  The function inspects the locale on the request object and appropriately updates the wording.

# Updates

Please watch this repo as we will periodically provide updates

# Feedback

We welcome all feedback.  Please create an issue in this repo if you have any questions, comments, or suggestions.
