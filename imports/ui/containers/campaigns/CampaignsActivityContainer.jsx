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
  const activityHandle = ActivitySubs.subscribe("entries.campaignActivity", {
    campaignId: props.campaignId,
    facebookId: props.facebookId
  });

  const loading = !activityHandle.ready();

  let facebookIds = props.campaign.accounts.map(acc => acc.facebookId);
  if (props.facebookId) {
    facebookIds = [props.facebookId];
  }

  const entriesOptions = {
    transform: function(item) {
      item.entry = Entries.findOne(item.entryId);
      return item;
    }
  };

  const likes = activityHandle.ready()
    ? Likes.find({
        facebookAccountId: { $in: facebookIds },
        created_time: { $exists: true }
      }, entriesOptions).fetch()
    : [];
  const comments = activityHandle.ready()
    ? Comments.find({
        facebookAccountId: { $in: facebookIds },
        created_time: { $exists: true }
      }, entriesOptions).fetch()
    : [];

  let activity = [];

  activity = activity.concat(likes);
  activity = activity.concat(
    comments.map(c => {
      return { ...c, type: "comment" };
    })
  );

  activity = sortBy(activity, item => -new Date(item.created_time));

  return {
    loading,
    activity
  };
})(CampaignsPeople);
