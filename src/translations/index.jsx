// import LngDetector from 'i18next-browser-languagedetector';
// import i18next from 'i18next';
import resources from './resources';

// i18next
//   .use(LngDetector)
//   .init({
//     detection: resources,
//   });
export const config = {
	interpolation: { escapeValue: false }, // React already does escaping
	lng: 'fr',
	resources,
	fallbackLng: 'en'
};

export { resources };
