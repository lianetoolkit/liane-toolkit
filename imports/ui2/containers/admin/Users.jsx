import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Jobs } from "/imports/api/jobs/jobs";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts";
import UsersPage from "/imports/ui2/pages/admin/Users.jsx";
import { pluck } from "underscore";

const CampaignsSubs = new SubsManager();

export default withTracker(props => {
  const queryParams = props.query;
  const limit = 10;
  const page = parseInt(queryParams.page || 1);
  const skip = (page - 1) * limit;

  const query = {};

  const options = {
    fields: {
      name: 1,
      type: 1,
      roles: 1,
      emails: 1,
      createdAt: 1
    },
    sort: { createdAt: -1 },
    limit,
    skip,
    transform: users => {
      return users;
    }
  };

  const usersHandle = CampaignsSubs.subscribe("users.all", {
    query,
    options
  });

  const loading = !usersHandle.ready();
  const users = usersHandle.ready() ? Meteor.users.find(query, options).fetch() : [];

  return {
    loading,
    page,
    limit,
    users
  };
})(UsersPage);
