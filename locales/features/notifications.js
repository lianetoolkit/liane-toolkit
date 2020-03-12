const messages = {
  campaignInvite: {
    id: "app.notifications.campaign_invite",
    defaultMessage: "{name} invited you to be a part of their campaign."
  },
  campaignInviteAccepted: {
    id: "app.notifications.campaign_invite_accepted",
    defaultMessage:
      "{name} accepted your invitation to be a part of {campaignName}."
  },
  campaignInviteDeclined: {
    id: "app.notifications.campaign_invite_declined",
    defaultMessage:
      "{name} declined your invitation to be a part of {campaignName}"
  }
};

module.exports = {
  messages: messages,
  list: Object.values(messages)
};
