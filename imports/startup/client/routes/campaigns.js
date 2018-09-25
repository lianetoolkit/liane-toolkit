import { FlowRouter } from "meteor/kadira:flow-router";
import React from "react";
import { mount } from "react-mounter";

import CampaignContainer from "/imports/ui/containers/campaigns/CampaignContainer.jsx";

import CampaignsPageContainer from "/imports/ui/containers/campaigns/CampaignsPageContainer.jsx";

import MapsPageContainer from "/imports/ui/containers/maps/MapsPageContainer.jsx";

import CanvasContainer from "/imports/ui/containers/canvas/CanvasContainer.jsx";
import CanvasEditContainer from "/imports/ui/containers/canvas/CanvasEditContainer.jsx";

import CampaignsSettingsContainer from "/imports/ui/containers/campaigns/CampaignsSettingsContainer.jsx";
import CampaignsPeopleContainer from "/imports/ui/containers/campaigns/CampaignsPeopleContainer.jsx";
import CampaignsActivityContainer from "/imports/ui/containers/campaigns/CampaignsActivityContainer.jsx";
import PeopleImportsContainer from "/imports/ui/containers/people/PeopleImportsContainer.jsx";
import PeopleInfoContainer from "/imports/ui/containers/people/PeopleInfoContainer.jsx";
import PeopleSinglePageContainer from "/imports/ui/containers/people/PeopleSinglePageContainer.jsx";
import PeopleEditContainer from "/imports/ui/containers/people/PeopleEditContainer.jsx";
import CampaignsAudienceContainer from "/imports/ui/containers/campaigns/CampaignsAudienceContainer.jsx";
import AdsCreateContainer from "/imports/ui/containers/ads/AdsCreateContainer.jsx";

import { APP_NAME, addTitle, trackRouteEntry } from "./utils.js";

// app routes
const campaignRoutes = FlowRouter.group({
  name: "app",
  prefix: "/campaign/:campaignId",
  triggersEnter: [trackRouteEntry]
});

const _mount = (params, config) => {
  return mount(CampaignContainer, {
    campaignId: params.campaignId,
    ...config
  });
};

campaignRoutes.route("/", {
  name: "App.campaignDetail",
  action: function(params) {
    addTitle(`${APP_NAME} | Campaign`);
    return _mount(params, {
      content: {
        component: CanvasContainer,
        props: { campaignId: params.campaignId }
      }
    });
  }
});
campaignRoutes.route("/settings", {
  name: "App.campaignSettings",
  action: function(params) {
    addTitle(`${APP_NAME} | Campaign`);
    return _mount(params, {
      content: {
        component: CampaignsSettingsContainer,
        props: { campaignId: params.campaignId }
      }
    });
  }
});
campaignRoutes.route("/maps", {
  name: "App.campaignMaps",
  action: function(params) {
    addTitle(`${APP_NAME} | Campaign`);
    return _mount(params, {
      content: {
        component: MapsPageContainer,
        props: { campaignId: params.campaignId }
      }
    });
  }
});
campaignRoutes.route("/canvas", {
  name: "App.campaignCanvas",
  action: function(params) {
    addTitle(`${APP_NAME} | Campaign`);
    return _mount(params, {
      content: {
        component: CanvasContainer,
        props: { campaignId: params.campaignId }
      }
    });
  }
});
campaignRoutes.route("/canvas/edit/:sectionKey?", {
  name: "App.campaignCanvas.edit",
  action: function(params) {
    addTitle(`${APP_NAME} | Campaign`);
    return _mount(params, {
      content: {
        component: CanvasEditContainer,
        props: { campaignId: params.campaignId, sectionKey: params.sectionKey }
      }
    });
  }
});
campaignRoutes.route("/people/view/:personId", {
  name: "App.campaignPeople.detail",
  action: function(params) {
    addTitle(`${APP_NAME} | Person`);
    return _mount(params, {
      content: {
        component: PeopleSinglePageContainer,
        props: { campaignId: params.campaignId, personId: params.personId }
      }
    });
  }
});
campaignRoutes.route("/people/edit/:personId/:sectionKey?", {
  name: "App.campaignPeople.edit",
  action: function(params) {
    addTitle(`${APP_NAME} | Edit person`);
    return _mount(params, {
      content: {
        component: PeopleEditContainer,
        props: {
          campaignId: params.campaignId,
          personId: params.personId,
          sectionKey: params.sectionKey
        }
      }
    });
  }
});
campaignRoutes.route("/people/activity/:facebookId?", {
  name: "App.campaignPeople.activity",
  action: function(params, queryParams) {
    addTitle(`${APP_NAME} | People Activity`);
    return _mount(params, {
      content: {
        component: CampaignsActivityContainer,
        props: {
          campaignId: params.campaignId,
          facebookId: params.facebookId,
          limit: queryParams.limit || 10,
          navTab: "activity"
        }
      }
    });
  }
});
campaignRoutes.route("/people/imports", {
  name: "App.campaignPeople.imports",
  action: function(params, queryParams) {
    addTitle(`${APP_NAME} | People Imports`);
    return _mount(params, {
      content: {
        component: PeopleImportsContainer,
        props: {
          campaignId: params.campaignId,
          navTab: "imports"
        }
      }
    });
  }
});
campaignRoutes.route("/people/info/:facebookId?", {
  name: "App.campaignPeople.info",
  action: function(params, queryParams) {
    addTitle(`${APP_NAME} | People Informations`);
    return _mount(params, {
      content: {
        component: PeopleInfoContainer,
        props: {
          campaignId: params.campaignId,
          facebookId: params.facebookId,
          navTab: "info"
        }
      }
    });
  }
});
campaignRoutes.route("/people/:facebookId?", {
  name: "App.campaignPeople",
  action: function(params) {
    addTitle(`${APP_NAME} | Campaign People`);
    return _mount(params, {
      content: {
        component: CampaignsPeopleContainer,
        props: {
          campaignId: params.campaignId,
          facebookId: params.facebookId,
          navTab: "directory"
        }
      }
    });
  }
});
campaignRoutes.route("/people/:facebookId?", {
  name: "App.campaignPeople.directory",
  action: function(params) {
    addTitle(`${APP_NAME} | Campaign People`);
    return _mount(params, {
      content: {
        component: CampaignsPeopleContainer,
        props: {
          campaignId: params.campaignId,
          facebookId: params.facebookId,
          navTab: "directory"
        }
      }
    });
  }
});
campaignRoutes.route("/audience/:navTab?", {
  name: "App.campaignAudience",
  action: function(params, queryParams) {
    addTitle(`${APP_NAME} | Campaign Audience`);
    return _mount(params, {
      content: {
        component: CampaignsAudienceContainer,
        props: {
          navTab: params.navTab,
          campaignId: params.campaignId,
          audienceFacebookId: queryParams.account
        }
      }
    });
  }
});
campaignRoutes.route("/audience/:navTab/category/:audienceCategoryId", {
  name: "App.campaignAudience.category",
  action: function(params, queryParams) {
    addTitle(`${APP_NAME} | Campaign Audience`);
    return _mount(params, {
      content: {
        component: CampaignsAudienceContainer,
        props: {
          navTab: params.navTab,
          campaignId: params.campaignId,
          audienceCategoryId: params.audienceCategoryId,
          audienceFacebookId: queryParams.account
        }
      }
    });
  }
});
campaignRoutes.route("/audience/:navTab/geolocation/:geolocationId", {
  name: "App.campaignAudience.geolocation",
  action: function(params, queryParams) {
    addTitle(`${APP_NAME} | Campaign Audience`);
    return _mount(params, {
      content: {
        component: CampaignsAudienceContainer,
        props: {
          navTab: params.navTab,
          campaignId: params.campaignId,
          geolocationId: params.geolocationId,
          audienceFacebookId: queryParams.account
        }
      }
    });
  }
});
campaignRoutes.route("/account/:facebookId", {
  name: "App.campaignDetail.account",
  action: function(params) {
    addTitle(`${APP_NAME} | Campaign`);
    return _mount(params, {
      content: {
        component: CampaignsPageContainer,
        props: { campaignId: params.campaignId, facebookId: params.facebookId }
      }
    });
  }
});

campaignRoutes.route("/ads/create/:audienceFacebookId", {
  name: "App.campaignAds.create",
  action: function(params, queryParams) {
    addTitle(`${APP_NAME} | Create Adset`);
    return _mount(params, {
      content: {
        component: AdsCreateContainer,
        props: {
          audienceCategoryId: queryParams.category,
          campaignId: params.campaignId,
          audienceFacebookId: params.audienceFacebookId
        }
      }
    });
  }
});
