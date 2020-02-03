import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Invites } from "/imports/api/campaigns/campaigns";
import InvitesPage from "/imports/ui2/pages/admin/Invites.jsx";
import { pluck } from "underscore";

const InvitesSubs = new SubsManager();

export default withTracker(props => {
  const queryParams = props.query;
  const limit = 10;
  const page = parseInt(queryParams.page || 1);
  const skip = (page - 1) * limit;

  const query = {};

  const options = {
    sort: { createdAt: -1 },
    limit,
    skip,
    transform: invite => {
      if (invite.usedBy) {
        invite.user = Meteor.users.findOne(invite.usedBy);
      }
      return invite;
    }
  };

  const invitesHandle = InvitesSubs.subscribe("invites.all", {
    query,
    options
  });

  const loading = !invitesHandle.ready();
  const invites = invitesHandle.ready()
    ? Invites.find(query, options).fetch()
    : [];

  return {
    loading,
    page,
    limit,
    invites
  };
})(InvitesPage);
