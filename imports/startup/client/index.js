if (!Meteor.settings.public.server || Meteor.settings.public.server == "main") {
  // import "./routes/index.js";
  // import "./globals.js";
  import "normalize.css";
  import "./icons";
  import "./routes2/index.js";
  // import "/imports/ui2";
}
