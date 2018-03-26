import { FlowRouter } from "meteor/kadira:flow-router";
import React from "react";
import { mount } from "react-mounter";

import CampaignContainer from "/imports/ui/containers/campaigns/CampaignContainer.jsx";

import CampaignsPageContainer from "/imports/ui/containers/campaigns/CampaignsPageContainer.jsx";

import CanvasContainer from "/imports/ui/containers/canvas/CanvasContainer.jsx";
import CanvasEditContainer from "/imports/ui/containers/canvas/CanvasEditContainer.jsx";

import CampaignsSettingsContainer from "/imports/ui/containers/campaigns/CampaignsSettingsContainer.jsx";
import CampaignsPeopleContainer from "/imports/ui/containers/campaigns/CampaignsPeopleContainer.jsx";
import PeopleSinglePageContainer from "/imports/ui/containers/people/PeopleSinglePageContainer.jsx";
import PeopleEditContainer from "/imports/ui/containers/people/PeopleEditContainer.jsx";
import CampaignsAudienceContainer from "/imports/ui/containers/campaigns/CampaignsAudienceContainer.jsx";
import CampaignsEntriesContainer from "/imports/ui/containers/campaigns/CampaignsEntriesContainer.jsx";
import CampaignsListsContainer from "/imports/ui/containers/campaigns/CampaignsListsContainer.jsx";
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
    addTitle(`${APP_NAME} | Campaign`);
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
    addTitle(`${APP_NAME} | Campaign`);
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
campaignRoutes.route("/people/:facebookId?", {
  name: "App.campaignPeople",
  action: function(params) {
    addTitle(`${APP_NAME} | Campaign`);
    return _mount(params, {
      content: {
        component: CampaignsPeopleContainer,
        props: { campaignId: params.campaignId, facebookId: params.facebookId }
      }
    });
  }
});
campaignRoutes.route("/audience/:audienceFacebookId?", {
  name: "App.campaignAudience",
  action: function(params) {
    addTitle(`${APP_NAME} | Campaign`);
    return _mount(params, {
      content: {
        component: CampaignsAudienceContainer,
        props: { campaignId: params.campaignId, facebookId: params.facebookId }
      }
    });
  }
});
campaignRoutes.route("/audience/:audienceFacebookId/category/:categoryId", {
  name: "App.campaignAudience.category",
  action: function(params) {
    addTitle(`${APP_NAME} | Campaign`);
    return _mount(params, {
      content: {
        component: CampaignsAudienceContainer,
        props: {
          campaignId: params.campaignId,
          facebookId: params.facebookId,
          categoryId: params.categoryId
        }
      }
    });
  }
});
campaignRoutes.route(
  "/audience/:audienceFacebookId/geolocation/:geolocationId",
  {
    name: "App.campaignAudience.geolocation",
    action: function(params) {
      addTitle(`${APP_NAME} | Campaign`);
      return _mount(params, {
        content: {
          component: CampaignsAudienceContainer,
          props: {
            campaignId: params.campaignId,
            facebookId: params.facebookId,
            geolocationId: params.geolocationId
          }
        }
      });
    }
  }
);
campaignRoutes.route("/entries/:facebookId?", {
  name: "App.campaignEntries",
  action: function(params) {
    addTitle(`${APP_NAME} | Campaign`);
    return _mount(params, {
      content: {
        component: CampaignsEntriesContainer,
        props: { campaignId: params.campaignId, facebookId: params.facebookId }
      }
    });
  }
});
campaignRoutes.route("/lists", {
  name: "App.campaignLists",
  action: function(params) {
    addTitle(`${APP_NAME} | Campaign`);
    return _mount(params, {
      content: {
        component: CampaignsListsContainer,
        props: { campaignId: params.campaignId }
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

campaignRoutes.route("/ads/create/:facebookAccountId", {
  name: "App.campaignAds.create",
  action: function(params, queryParams) {
    addTitle(`${APP_NAME} | Campaign`);
    return _mount(params, {
      content: {
        component: AdsCreateContainer,
        props: {
          audienceCategoryId: queryParams.category,
          campaignId: params.campaignId,
          facebookAccountId: params.facebookAccountId
        }
      }
    });
  }
});
