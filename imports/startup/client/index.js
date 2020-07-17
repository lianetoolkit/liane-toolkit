if (!Meteor.settings.public.server || Meteor.settings.public.server == "main") {
  require("./globals.js");
  require("./icons");
  require("./routes2/index.js");
}
