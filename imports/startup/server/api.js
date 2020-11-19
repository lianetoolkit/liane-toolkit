import "/imports/api/users/users";

// access logs
import "/imports/api/accessLogs/server/accessLogsMethods.js";

// feeedback
import "/imports/api/feedback/server/feedbackMethods.js";
import "/imports/api/feedback/server/feedbackPublications.js";

// users
import "/imports/api/users/server/usersMethods.js";
import "/imports/api/users/server/usersPublications.js";

// options
// import "/imports/api/options/server/optionsMethods.js";
// import "/imports/api/options/server/optionsPublications.js";

// campaigns
import "/imports/api/campaigns/server/campaignsMethods.js";
import "/imports/api/campaigns/server/campaignsPublications.js";

// faq
import "/imports/api/faq/server/faqMethods.js";
import "/imports/api/faq/server/faqPublications.js";

// entries
import "/imports/api/facebook/entries/server/entriesPublications.js";
import "/imports/api/facebook/entries/server/entriesMethods.js";

// likes
import "/imports/api/facebook/likes/server/likesPublications.js";
import "/imports/api/facebook/likes/server/likesMethods.js";

// comments
import "/imports/api/facebook/comments/server/commentsMethods.js";
import "/imports/api/facebook/comments/server/commentsPublications.js";

// people
import "/imports/api/facebook/people/server/peopleMethods.js";
import "/imports/api/facebook/people/server/peoplePublications.js";

// dashboard
import "/imports/api/dashboard/server/dashboardMethods.js";
// import "/imports/api/dashboard/server/dashboardPublications.js";

// geolocations
import "/imports/api/geolocations/server/geolocationsMethods.js";
import "/imports/api/geolocations/server/geolocationsPublications.js";

// facebook accounts
import "/imports/api/facebook/accounts/server/accountsMethods.js";

// map layers
import "/imports/api/mapLayers/server/mapLayersMethods.js";
import "/imports/api/mapLayers/server/mapLayersPublications.js";

// map features
import "/imports/api/mapFeatures/server/mapFeaturesMethods.js";
import "/imports/api/mapFeatures/server/mapFeaturesPublications.js";

// notifications
import "/imports/api/notifications/server/notificationsMethods.js";
import "/imports/api/notifications/server/notificationsPublications.js";

// messages
import "/imports/api/messages/server/messagesMethods.js";
import "/imports/api/messages/server/messagesPublications.js";

// jobs
import "/imports/api/jobs/server/jobs.js";
import "/imports/api/jobs/server/jobsMethods.js";
import "/imports/api/jobs/server/jobsPublications.js";

if (Meteor.settings.public.deployMode == "local") {
  import "/imports/api/campaigns/server/campaignsHelpers.js";
  import "/imports/api/geolocations/server/geolocationsHelpers.js";
  import "/imports/api/facebook/accounts/server/accountsHelpers.js";
  import "/imports/api/facebook/people/server/peopleHelpers.js";
  import "/imports/api/facebook/entries/server/entriesHelpers.js";
  import "/imports/api/facebook/likes/server/likesHelpers.js";
  import "/imports/api/facebook/comments/server/commentsHelpers.js";
}
