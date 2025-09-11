export const getAppLanguages = () => {
  const languages = process.env.REACT_APP_LANGUAGES || 'fr';

  return languages.split(',');
}