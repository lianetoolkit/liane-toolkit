if (typeof Meteor == "undefined") {
  const fs = require("fs");
  const nodeGlob = require("glob");
  const mkdirp = require("mkdirp");
  const { get } = require("lodash");
  const { transform, transformSync, parseSync } = require("@babel/core");

  const FILES_TO_PARSE = "imports/**/!(*.test).{js,jsx}";

  const glob = (pattern) =>
    new Promise((resolve, reject) => {
      nodeGlob(pattern, (error, value) =>
        error ? reject(error) : resolve(value)
      );
    });

  const readFile = (fileName) =>
    new Promise((resolve, reject) => {
      fs.readFile(fileName, "utf8", (error, value) =>
        error ? reject(error) : resolve(value)
      );
    });

  const newLine = () => process.stdout.write("\n");

  let messageMap = {};

  // features messages
  const notificationsMessages = require("../locales/features/notifications")
    .list;
  for (let message of notificationsMessages) {
    messageMap[message.id] = message;
  }
  const permissionsMessages = require("../locales/features/permissions").list;
  for (let message of permissionsMessages) {
    messageMap[message.id] = message;
  }
  const peopleMetaMessages = require("../locales/features/peopleMeta").list;
  for (let message of peopleMetaMessages) {
    messageMap[message.id] = message;
  }
  const facebookReactionsMessages = require("../locales/features/facebookReactions")
    .list;
  for (let message of facebookReactionsMessages) {
    messageMap[message.id] = message;
  }

  const extractFromFile = async (filename) => {
    try {
      if (filename.indexOf("/server/") == -1) {
        const code = await readFile(filename);
        const output = await transform(code, {
          filename,
          presets: ["@babel/preset-env", "@babel/preset-react"],
          plugins: ["@babel/plugin-proposal-class-properties", "react-intl"],
        });
        const messages = get(output, "metadata.react-intl.messages", []);

        for (const message of messages) {
          messageMap[message.id] = message;
        }
      }
    } catch (error) {
      process.stderr.write(
        `\nError transforming file: ${filename}\n${error}\n`
      );
    }
  };

  const memoryTask = glob(FILES_TO_PARSE);

  memoryTask.then((files) => {
    const extractTask = Promise.all(
      files.map((fileName) => extractFromFile(fileName))
    );
    extractTask.then(() => {
      mkdirp("./locales/messages").then(() => {
        fs.writeFileSync(
          "./locales/messages/messages.json",
          JSON.stringify(Object.values(messageMap))
        );

        const {
          default: manageTranslations,
        } = require("react-intl-translations-manager");

        manageTranslations({
          messagesDirectory: "./locales/messages",
          translationsDirectory: "./locales/",
          whitelistsDirectory: "./locales/whitelists",
          languages: ["en"],
          singleMessagesFile: true,
        });
      });
    });
  });
}
