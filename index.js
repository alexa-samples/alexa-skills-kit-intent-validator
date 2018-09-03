/* eslint-disable  func-names */
/* eslint-disable  no-console */
/* eslint-disable  no-restricted-syntax */
/* -*- coding: utf-8 -*- */

/*
Copyright 2016-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Amazon Software License (the "License"). You may not use this file except in 
compliance with the License. A copy of the License is located at
    http://aws.amazon.com/asl/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, 
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific 
language governing permissions and limitations under the License.
*/

/*
The Alexa ASK Intent Validator is designed for medium-complex Intent Schema validation. If you need 
to quickly try many different combinations of your utterances ON your devices, this is the tool for you.

Currently supports all variants of English, German, French, Italian and Spanish.
 **/

// Use the new Alexa SDK
const Alexa = require('ask-sdk');
// Use the internationalization library
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');

// UPDATEME: Does your skill use Dialog Directives?  If so, update this to true.
const DIALOG_DIRECTIVE_SUPPORT = true;


/* Intent Handlers */
const LaunchReflectorHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes.dialogSession = true;

    const speechOutput = requestAttributes.t('launchRequestResponse');

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withShouldEndSession(false)
      .getResponse();
  }
}


// The main handler - here we simply take the inbound Alexa request, parse out the intent and slots, then return back 
  // to the user, either as a dialog
  const UnhandledHandler = {
    canHandle(handlerInput) {
      return true;
    },
    handle(handlerInput) {
      let request = handlerInput.requestEnvelope.request;
      const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      let intentInfo = parseIntentsAndSlotsFromEvent(request, requestAttributes);

      // If dialog directive support is enabled AND it exists and it is not in "completed" status, delegate back to the interaction model
      if (DIALOG_DIRECTIVE_SUPPORT && request.dialogState && request.dialogState !== 'COMPLETED') {
        const currentIntent = handlerInput.requestEnvelope.request.intent;
        return handlerInput.responseBuilder
          .addDelegateDirective(currentIntent)
          .getResponse();
      } else {
        requestAttributes.intentOutput = intentInfo.cardInfo;

        // Determine if we are going to end the session or keep it in dialog mode.  When used in dialog mode we use reprompt 
        // as we are expecting another question to come through.  When used in OneShot mode we say the info and end the session.
        if (sessionAttributes.dialogSession) {
          return handlerInput.responseBuilder
            .speak(intentInfo.response)
            .reprompt(requestAttributes.t('still_listening'))
            .withSimpleCard(requestAttributes.t('card_title'), intentInfo.cardInfo)
            .getResponse();
        } else {
          return handlerInput.responseBuilder
            .speak(intentInfo.response)
            .withSimpleCard(requestAttributes.t('card_title'), intentInfo.cardInfo)
            .getResponse();
        }
      }
    }
  }
  
  /**
 * Parses the collected event info from Alexa into a friendlier TTS response and 
 * creates a card response with Intent/Slot info
 */
function parseIntentsAndSlotsFromEvent (request, requestAttributes) {
  // Cleanse the request intent name
  let intentName = request.intent.name.replace(/[^a-zA-Z0-9]/g, ' ');

  let numSlots = 0;
  let slots = request.intent.slots;

  let filledInSlots = {};

  if (slots) {
    for (let i in slots) {
      // Check if there is a value in a given slot
      if (slots[i].value) {
        filledInSlots[slots[i].name] = slots[i].value;
        numSlots++;
      }
    }
  }

  let responseText = `${intentName} ${requestAttributes.t('received_with')} ${numSlots} ${requestAttributes.t('slots')}`;
  let cardInfo = `${intentName} ${requestAttributes.t('received_with')} ${numSlots} ${requestAttributes.t('slots')}`;

  if (filledInSlots > 0) {
    responseText += requestAttributes.t('received_slots_are');
  }

  for (let slotName in filledInSlots) {
    responseText += ` ${slotName} is ${filledInSlots[slotName]}. `;
    cardInfo += `\n${slotName}: ${filledInSlots[slotName]}`;
  }

  return {
    response: responseText,
    cardInfo: cardInfo
  }
}

const ExitHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest'
      || (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent'
      || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'))
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const speechOutput = requestAttributes.t('exit');

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .getResponse();
  }
}


const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const speakOutput = requestAttributes.t('error');
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
}



// Interceptor to use i18next based on the locale of the user
const LocalizationInterceptor = {
  process(handlerInput) {
    const localizationClient = i18n.use(sprintf).init({
      lng: handlerInput.requestEnvelope.request.locale,
      overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
      resources: languageStrings,
      returnObjects: true
    })

    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function (...args) {
      return localizationClient.t(...args);
    }
  }
}

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchReflectorHandler,
    ExitHandler,
    UnhandledHandler
  )
  .addErrorHandlers(
    ErrorHandler
  )
  .addRequestInterceptors(
    LocalizationInterceptor
  )
  .lambda();



  
// Series of strings for language tokenization
const languageStrings = {
  en: {
    translation: {
      launchRequestResponse: 'Launch Request for dialog mode, the session will be kept open until you say, exit',
      exit: 'Goodbye.',
      error: "Sorry, I can't understand the command. Please say again.",
      received_with: ' received with ',
      slot: ' slot. ',
      slots: ' slots. ',
      still_listening: "I'm still listening,  Please try another intent or say, stop",
      received_slots_are: 'Received slots are ',
      card_title: 'Reflected Intent'
    }
  },
  'en-GB': {
    translation: {
      exit: 'Farewell.'
    }
  },
  de: {
    translation: {
      launchRequestResponse: 'Launch Request. Gib den nächsten Befehl oder sage Abbruch',
      exit: 'Auf Wiedersehen.',
      error: 'Entschuldigung, ich kann den Befehl nicht verstehen. Bitte noch einmal sagen.',
      received_with: ' empfangen mit ',
      slot: ' Slot. ',
      slots: ' Slots. ',
      still_listening: 'Ich lausche noch immer. Bitte gebe einen neuen Befehl oder sage Stop.',
      received_slots_are: 'Empfangene Slots sind ',
      card_title: 'Reflektierte Absicht'
    }
  },
  fr: {
    translation: {
      launchRequestResponse: "On passe en mode dialogue, la session restera ouverte jusqu'à ce que vous disiez, arrête",
      exit: 'Au revoir.',
      error: "Désolé, je ne peux pas comprendre la commande. Répétez s'il vous pait.",
      received_with: ' reçu avec ',
      slot: ' slotte. ',
      slots: ' slottes. ',
      still_listening: "J'écoute encore,  Veuillez réessayer ou dites, arrête",
      received_slots_are: 'Les slottes reçus sont ',
      card_title: 'Intent Reflété'
    }
  },
  es: {
    translation: {
      launchRequestResponse: 'Petición de Lanzamiento. Pasando a modo diálogo. La sesión permanecerá abierta hasta que digas para.',
      exit: 'Adiós.',
      error: 'Lo siento, no puedo entender el comando. Dilo otra vez por favor.',
      received_with: ' recibido con ',
      slot: ' parámetro. ',
      slots: ' parámetros. ',
      still_listening: 'Sigo aquí. Qué quieres que repita?',
      received_slots_are: 'Los paraáetros recibidos son ',
      card_title: 'Intent Reflejado'
    }
  },
  'es-MX': {
    translation: {
      exit: 'Nos vemos.'
    }
  },
  it: {
    translation: {
      launchRequestResponse: 'Richiesta di lancio. Passando alla modalità di dialogo, la sessione rimarrà aperta finché non dirai, esci',
      exit: 'Addio.',
      error: 'Scusa, non riesco a capire il comando. Per favore, ripeti.',
      received_with: ' ricevuto con ',
      slot: ' parametro. ',
      slots: ' parametri. ',
      still_listening: 'Sono ancora. Qui Cosa vuoi che ripeta?',
      received_slots_are: 'I parametri ricevuti sono ',
      card_title: 'Intent Riflesso'
    }
  }
}