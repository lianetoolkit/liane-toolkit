import { ClientStorage } from "meteor/ostrio:cstorage";

export const getFormUrl = (formId, campaign = false) => {
  campaign = campaign || ClientStorage.get("campaign");
  const base = Meteor.absoluteUrl();
  const prefix = "f/";
  let path = "";
  if (campaign.forms && campaign.forms.slug) {
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
