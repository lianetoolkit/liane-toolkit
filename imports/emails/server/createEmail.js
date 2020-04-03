import fs from "fs";
import Path from "path";

import React from "react";
import ReactDOMServer from "react-dom/server";

import Email from "../components/Email.jsx";
import Notification from "../templates/Notification.jsx";
import ResetPassword from "../templates/ResetPassword.jsx";
import VerifyEmail from "../templates/VerifyEmail.jsx";
import Default from "../templates/Default.jsx";

const STYLE_TAG = "%STYLE%";
const CONTENT_TAG = "%CONTENT%";

/**
 * Get the file from a relative path
 * @param {String} relativePath
 * @return {Promise.<string>}
 */
function getFile(relativePath) {
  return new Promise((resolve, reject) => {
    const path = Path.join(Meteor.absolutePath, __dirname, relativePath);
    return fs.readFile(path, { encoding: "utf8" }, (err, file) => {
      if (err) return reject(err);
      return resolve(file);
    });
  });
}

function getTemplate(type, language = "en", data = {}, title = "") {
  let content = { component: null };
  switch (type) {
    case "notification":
      content.component = Notification;
      break;
    case "resetPassword":
      content.component = ResetPassword;
      break;
    case "verifyEmail":
      content.component = VerifyEmail;
      break;
    default:
      content.component = Default;
  }
  return function() {
    return (
      <Email language={language}>
        <content.component data={data} title={title} />
      </Email>
    );
  };
}

function extractTitle(html) {
  let titleParse = html.split('class="title-heading">');
  if (titleParse && titleParse.length) {
    const titleContent = titleParse[1].split("</h2>")[0];
    const regex = /(<([^>]+)>)/gi;
    return titleContent.replace(regex, "");
  }
  return "";
}

function createEmail(type, language = "en", data = {}, title = "") {
  return Promise.all([getFile("./inlined.css"), getFile("./email.html")]).then(
    ([style, template]) => {
      const element = React.createElement(
        getTemplate(type, language, data, title)
      );
      const content = ReactDOMServer.renderToStaticMarkup(element);
      const subject = extractTitle(content);
      // Replace the template tags with the content
      let emailHTML = template;
      emailHTML = emailHTML.replace(CONTENT_TAG, content);
      emailHTML = emailHTML.replace(STYLE_TAG, style);

      return {
        subject,
        body: emailHTML
      };
    }
  );
}

module.exports = createEmail;