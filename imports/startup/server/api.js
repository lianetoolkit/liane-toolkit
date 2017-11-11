// users
// import "/imports/api/users/server/usersMethods.js";
import "/imports/api/users/server/usersPublications.js";

// contexts
import "/imports/api/contexts/server/contextsMethods.js";
import "/imports/api/contexts/server/contextsPublications.js";

// campaigns
import "/imports/api/campaigns/server/campaignsMethods.js";
import "/imports/api/campaigns/server/campaignsPublications.js";

// facebook
import "/imports/api/facebook/accounts/server/accountsMethods.js";

// jobs
import "/imports/api/jobs/server/jobs.js";
import "/imports/api/jobs/server/jobsMethods.js";
import "/imports/api/jobs/server/jobsPublications.js";

if (Meteor.settings.public.deployMode == "local") {
  import "/imports/api/facebook/accounts/server/accountsHelpers.js";
}
