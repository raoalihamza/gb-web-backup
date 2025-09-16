export const getAppLanguages = () => {
  const languages = import.meta.env.VITE__LANGUAGES || 'fr';

  return languages.split(',');
}