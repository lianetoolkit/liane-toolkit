export const getFormUrl = (campaign, formId) => {
  const base = Meteor.absoluteUrl();
  let path = "";
  if (campaign.forms && campaign.forms.slug) {
    path += campaign.forms.slug;
  }
  if (formId) {
    if (!path) {
      path += "f";
    }
    path += "/" + formId;
  }
  if (!path) {
    path += "f/?c=" + campaign._id;
  }
  let url = base;
  if (!base.endsWith("/")) url += "/";
  url += path;
  return url;
};
