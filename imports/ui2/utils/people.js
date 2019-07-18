import { Campaigns } from "/imports/api/campaigns/campaigns";
import { ClientStorage } from "meteor/ostrio:cstorage";

export const getFormUrl = (formId, campaignId = false) => {
  campaignId = campaignId || ClientStorage.get("campaign");
  const campaign = Campaigns.findOne(campaignId);
  const base = Meteor.absoluteUrl();
  let prefix = "f/";
  let path = "";
  if (campaign.forms && campaign.forms.slug) {
    prefix = "";
    path += campaign.forms.slug + "/";
  }
  if (formId) {
    path += formId + "/";
  }
  if (!path) {
    path += "?c=" + campaign._id;
  }
  let url = base;
  if (!base.endsWith("/")) url += "/";
  url += prefix + path;
  return url;
};
