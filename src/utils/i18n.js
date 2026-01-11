export function getLanguage() {
  const lang = navigator.language || navigator.userLanguage;
  return lang.startsWith("zh") ? "zh" : "en";
}

export function createI18n(translations) {
  const lang = getLanguage();
  const t = (key) => {
    return translations[lang]?.[key] || translations["en"]?.[key] || key;
  };
  return { t, lang };
}
