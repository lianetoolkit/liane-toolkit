import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Campaigns } from "/imports/api/campaigns/campaigns";
import UsersPage from "/imports/ui2/pages/admin/Users.jsx";

const CampaignsSubs = new SubsManager();

export default withTracker((props) => {
  const queryParams = props.query;
  const limit = 10;
  const page = parseInt(queryParams.page || 1);
  const skip = (page - 1) * limit;

  const query = {};

  if (queryParams.q) {
    query.$text = { $search: queryParams.q };
  }

  const options = {
    fields: {
      name: 1,
      type: 1,
      roles: 1,
      emails: 1,
      createdAt: 1,
    },
    sort: { createdAt: -1 },
    limit,
    skip,
    transform: (user) => {
      user.campaigns = Campaigns.find(
        {
          users: { $elemMatch: { userId: user._id } },
        },
        { fields: { name: 1 } }
      ).fetch();
      return user;
    },
  };

  const usersHandle = CampaignsSubs.subscribe("users.all", {
    query,
    options,
  });

  const getClientQuery = (query) => {
    // Minimongo does not support $text operator
    // https://forums.meteor.com/t/error-using-text-in-mongo-find/1667
    if (query.$text) {
      const search = query.$text.$search;
      query.name = new RegExp(search, "i");
      delete query.$text;
    }
    return query;
  };

  const loading = !usersHandle.ready();
  const users = usersHandle.ready()
    ? Meteor.users.find(getClientQuery(query), options).fetch()
    : [];

  return {
    query,
    loading,
    page,
    limit,
    users,
  };
})(UsersPage);
