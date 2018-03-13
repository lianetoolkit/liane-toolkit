if (!Meteor.settings.public.server || Meteor.settings.public.server == "main") {
  import "./routes/index.js";
  import "./globals.js";
}
