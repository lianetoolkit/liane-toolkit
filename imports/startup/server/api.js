// users
import "/imports/api/users/server/usersMethods.js";
import "/imports/api/users/server/usersPublications.js";

// options
import "/imports/api/options/server/optionsMethods.js";
import "/imports/api/options/server/optionsPublications.js";

// contexts
import "/imports/api/contexts/server/contextsMethods.js";
import "/imports/api/contexts/server/contextsPublications.js";

// audience categories
import "/imports/api/audienceCategories/server/audienceCategoriesMethods.js";
import "/imports/api/audienceCategories/server/audienceCategoriesPublications.js";

// campaigns
import "/imports/api/campaigns/server/campaignsMethods.js";
import "/imports/api/campaigns/server/campaignsPublications.js";

// canvas
import "/imports/api/canvas/server/canvasMethods.js";
import "/imports/api/canvas/server/canvasPublications.js";

// entries
import "/imports/api/facebook/entries/server/entriesPublications.js";
import "/imports/api/facebook/entries/server/entriesMethods.js";

// likes
import "/imports/api/facebook/likes/server/likesPublications.js";

// comments
import "/imports/api/facebook/comments/server/commentsPublications.js";

// people
import "/imports/api/facebook/people/server/peopleMethods.js";
import "/imports/api/facebook/people/server/peoplePublications.js";

// audiences
import "/imports/api/facebook/audiences/server/audiencesMethods.js";
import "/imports/api/facebook/audiences/server/audiencesPublications.js";

// ad accounts
import "/imports/api/facebook/adAccounts/server/adAccountsPublications.js";

// ads
import "/imports/api/facebook/ads/server/adsMethods.js";

// geolocations
import "/imports/api/geolocations/server/geolocationsMethods.js";
import "/imports/api/geolocations/server/geolocationsPublications.js";


// facebook accounts
import "/imports/api/facebook/accounts/server/accountsMethods.js";

// geolocations
import "/imports/api/mapLayers/server/mapLayersMethods.js";
import "/imports/api/mapLayers/server/mapLayersPublications.js";

// jobs
import "/imports/api/jobs/server/jobs.js";
import "/imports/api/jobs/server/jobsMethods.js";
import "/imports/api/jobs/server/jobsPublications.js";

if (Meteor.settings.public.deployMode == "local") {
  import "/imports/api/campaigns/server/campaignsHelpers.js";
  import "/imports/api/geolocations/server/geolocationsHelpers.js";
  import "/imports/api/facebook/accounts/server/accountsHelpers.js";
  import "/imports/api/facebook/people/server/peopleHelpers.js";
  import "/imports/api/facebook/audiences/server/audiencesHelpers.js";
  import "/imports/api/facebook/entries/server/entriesHelpers.js";
  import "/imports/api/facebook/likes/server/likesHelpers.js";
  import "/imports/api/facebook/comments/server/commentsHelpers.js";
}
