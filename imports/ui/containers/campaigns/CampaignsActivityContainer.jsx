import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { People } from "/imports/api/facebook/people/people.js";
import { Entries } from "/imports/api/facebook/entries/entries.js";
import { Likes } from "/imports/api/facebook/likes/likes.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";
import CampaignsPeople from "/imports/ui/pages/campaigns/CampaignsPeople.jsx";
import { sortBy } from "lodash";

const ActivitySubs = new SubsManager();

export default withTracker(props => {
  const queryParams = FlowRouter.current().queryParams;

  const activityHandle = ActivitySubs.subscribe("entries.campaignActivity", {
    campaignId: props.campaignId,
    facebookId: props.facebookId,
    queryParams,
    limit: props.limit || 10
  });

  const loading = !activityHandle.ready();

  let facebookIds = props.campaign.accounts.map(acc => acc.facebookId);
  if (props.facebookId) {
    facebookIds = [props.facebookId];
  }

  let query = { resolved: { $ne: true } };
  if (queryParams.resolved == "true") {
    query.resolved = true;
  }

  const entriesOptions = {
    transform: function(item) {
      item.entry = Entries.findOne(item.entryId);
      item.person = People.findOne({
        facebookId: item.personId,
        campaignId: props.campaignId
      });
      return item;
    }
  };

  let likes = [];
  if (queryParams.type !== "comment") {
    likes = activityHandle.ready()
      ? Likes.find(
          {
            ...query,
            facebookAccountId: { $in: facebookIds },
            created_time: { $exists: true }
          },
          entriesOptions
        ).fetch()
      : [];
  }
  let comments = [];
  if (queryParams.type !== "reaction") {
    comments = activityHandle.ready()
      ? Comments.find(
          {
            ...query,
            facebookAccountId: { $in: facebookIds },
            created_time: { $exists: true }
          },
          entriesOptions
        ).fetch()
      : [];
  }

  let activity = [];

  activity = activity.concat(likes);
  activity = activity.concat(
    comments.map(c => {
      return { ...c, type: "comment" };
    })
  );

  activity = sortBy(activity, item => -new Date(item.created_time));

  return {
    limit: props.limit || 10,
    loading,
    activity,
    query
  };
})(CampaignsPeople);
