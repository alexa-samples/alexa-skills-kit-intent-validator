#Alexa ASK Intent Validator

The Alexa ASK Intent Validator is designed to help validate your Alexa interaction models.  Need to quickly try many different combinations of your utterances ON your devices, this is the tool for you.  While intended for medium-complex models, it can work on ANY interaction models.  

##How it Works

The intent validator is a lambda function that simply interprets the received event request from Alexa and states the key pieces of information (intent and slots) back to the user and displays in the card.

To use, simply take the code and deploy as a lambda function (in US East - Virginia). On your skill's configuration's Service Endpoint Type, ensure AWS Lambda ARN is selected, and paste the ARN ID into the form.

There are two ways to utilize – issuing a launch request (ie “open”) will have the skill will remain in dialog mode – one can continuously tell it different utterances until you say “exit”.  OneShot is also supported – ie “Ask SkillName to do this utterance” and the Alexa session ends afterwards.

##Language Support

English and German languages are both supported.  The function inspects the locale on the request object and appropriately updates the wording.

#Updates

Please watch this repo as we will periodically provide updates

#Feedback

We welcome all feedback.  Please create an issue in this repo if you have any questions, comments, or suggestions.