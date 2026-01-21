import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Entry flow
      'entry.selectLanguage': 'Select Language',
      'entry.selectRole': 'Select Your Role',
      'entry.teacher': 'Teacher',
      'entry.crp': 'CRP / ARP',
      'entry.explainer': '30-second Explainer',
      'entry.explainerText': 'TeachPivot helps you find the right approach before class, based on what usually works for common teaching challenges.',
      'entry.enterApp': 'Enter App',

      // Context selection
      'context.subject': 'Select Subject',
      'context.grade': 'Select Grade',
      'context.topic': 'Select Topic',
      'context.next': 'Next',

      // Situation selection
      'situation.title': 'What\'s the challenge?',
      'situation.prerequisiteGap': 'Prerequisite Gap',
      'situation.cantVisualize': 'Can\'t Visualize',
      'situation.mixedPace': 'Mixed Pace',
      'situation.languageNotLanding': 'Language Not Landing',
      'situation.activityChaos': 'Activity Chaos',
      'situation.workedOnceFailed': 'Worked Once, Failed Later',

      // Prep card
      'prepCard.whatBreaksHere': 'What usually breaks here:',
      'prepCard.earlyWarnings': 'Early warning signs:',
      'prepCard.ifLost': 'If students are LOST, try this:',
      'prepCard.ifBored': 'If students are BORED, try this:',
      'prepCard.done': 'Done',
      'prepCard.peerInsights': 'From other teachers:',

      // Post-reflection
      'reflection.outcome': 'How did it go?',
      'reflection.worked': 'Worked',
      'reflection.partiallyWorked': 'Partially Worked',
      'reflection.didntWork': 'Didn\'t Work',
      'reflection.reason': 'Why?',
      'reflection.timingIssue': 'Timing issue',
      'reflection.prerequisiteWeak': 'Prerequisite weak',
      'reflection.exampleDidntLand': 'Example didn\'t land',
      'reflection.languageConfusion': 'Language confusion',
      'reflection.none': 'Skip',
      'reflection.submit': 'Submit',
      'reflection.thanks': 'Thank you for the feedback!',

      // CRP view
      'crp.title': 'Dashboard',
      'crp.topicHeatmap': 'Topic Difficulty Heatmap',
      'crp.situationClusters': 'Situation Clusters',
      'crp.noTeacherIds': 'No teacher identifiers shown',

      // Common
      'common.loading': 'Loading...',
      'common.error': 'Something went wrong',
      'common.tryAgain': 'Try Again',
      'common.offline': 'You\'re offline - some features may be limited'
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
