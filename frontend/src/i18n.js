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
  },
  es: {
    translation: {
      'entry.selectLanguage': 'Seleccionar idioma',
      'entry.selectRole': 'Selecciona tu rol',
      'entry.teacher': 'Profesor',
      'entry.crp': 'CRP / ARP',
      'entry.explainer': 'Explicador de 30 segundos',
      'entry.explainerText': 'TeachPivot te ayuda a encontrar el enfoque correcto antes de clase, basado en lo que suele funcionar para los desafíos de enseñanza comunes.',
      'entry.enterApp': 'Entrar a la aplicación',

      'context.subject': 'Seleccionar materia',
      'context.grade': 'Seleccionar grado',
      'context.topic': 'Seleccionar tema',
      'context.next': 'Siguiente',

      'situation.title': '¿Cuál es el desafío?',
      'situation.prerequisiteGap': 'Brecha de requisitos previos',
      'situation.cantVisualize': 'No se puede visualizar',
      'situation.mixedPace': 'Ritmo mixto',
      'situation.languageNotLanding': 'El lenguaje no llega',
      'situation.activityChaos': 'Caos de actividades',
      'situation.workedOnceFailed': 'Funcionó una vez, falló después',

      'prepCard.whatBreaksHere': 'Qué suele romperse aquí:',
      'prepCard.earlyWarnings': 'Señales de alerta temprana:',
      'prepCard.ifLost': 'Si los estudiantes están PERDIDOS, intenta esto:',
      'prepCard.ifBored': 'Si los estudiantes están ABURRIDOS, intenta esto:',
      'prepCard.done': 'Listo',
      'prepCard.peerInsights': 'De otros profesores:',

      'reflection.outcome': '¿Cómo fue?',
      'reflection.worked': 'Funcionó',
      'reflection.partiallyWorked': 'Funcionó parcialmente',
      'reflection.didntWork': 'No funcionó',
      'reflection.reason': '¿Por qué?',
      'reflection.timingIssue': 'Problema de timing',
      'reflection.prerequisiteWeak': 'Requisito previo débil',
      'reflection.exampleDidntLand': 'El ejemplo no funcionó',
      'reflection.languageConfusion': 'Confusión de lenguaje',
      'reflection.none': 'Omitir',
      'reflection.submit': 'Enviar',
      'reflection.thanks': '¡Gracias por los comentarios!',

      'crp.title': 'Panel de control',
      'crp.topicHeatmap': 'Mapa de calor de dificultad de tema',
      'crp.situationClusters': 'Agrupaciones de situaciones',
      'crp.noTeacherIds': 'No se muestran identificadores de profesores',

      'common.loading': 'Cargando...',
      'common.error': 'Algo salió mal',
      'common.tryAgain': 'Intentar de nuevo',
      'common.offline': 'Estás sin conexión - algunas características pueden estar limitadas'
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
