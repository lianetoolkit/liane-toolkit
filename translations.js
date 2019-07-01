if (typeof Meteor == "undefined") {
  const {
    default: manageTranslations
  } = require("react-intl-translations-manager");

  manageTranslations({
    messagesDirectory: "./locales/messages",
    translationsDirectory: "./locales/",
    languages: ["en", "es", "pt-BR"],
    singleMessagesFile: true
  });
}
