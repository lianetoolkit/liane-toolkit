const messages = {
  campaignInvite: {
    id: "app.notifications.campaign_invite",
    defaultMessage: "{name} invited you to be a part of their campaign.",
  },
  campaignInviteAccepted: {
    id: "app.notifications.campaign_invite_accepted",
    defaultMessage:
      "{name} accepted your invitation to be a part of {campaignName}.",
  },
  campaignInviteDeclined: {
    id: "app.notifications.campaign_invite_declined",
    defaultMessage:
      "{name} declined your invitation to be a part of {campaignName}",
  },
  newFormUser: {
    id: "app.notifications.new_form_user",
    defaultMessage: "{name} just registered through your form!",
  },
  updateFormUser: {
    id: "app.notifications.update_form_user",
    defaultMessage: "{name} just updated their profile through your form!",
  },
  peopleImportStart: {
    id: "app.notifications.people_import_start",
    defaultMessage: "An import is in progress",
  },
  peopleImportEnd: {
    id: "app.notifications.people_import_end",
    defaultMessage: "An import has finished",
  },
};

module.exports = {
  messages: messages,
  list: Object.values(messages),
};
