export const getAppLanguages = () => {
  const languages = import.meta.env.VITE_LANGUAGES || 'fr';

  return languages.split(',');
}