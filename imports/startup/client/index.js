if (!Meteor.settings.public.server || Meteor.settings.public.server == "main") {
  // import "./globals.js";
  require("./icons");
  require("./routes2/index.js");
}
