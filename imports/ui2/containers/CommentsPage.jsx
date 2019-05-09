import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { People } from "/imports/api/facebook/people/people.js";
import { Entries } from "/imports/api/facebook/entries/entries.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";
import CommentsPage from "../pages/Comments.jsx";
import { sortBy } from "lodash";

const CommentsSubs = new SubsManager();

export default withTracker(props => {
  const queryParams = FlowRouter.current().queryParams;

  const commentsHandle = CommentsSubs.subscribe("comments.byAccount", {
    campaignId: props.campaignId,
    queryParams,
    limit: props.limit || 10
  });

  const loading = !commentsHandle.ready();

  let facebookIds = props.campaign.accounts.map(acc => acc.facebookId);
  if (props.facebookId) {
    facebookIds = [props.facebookId];
  }

  let query = { resolved: { $ne: true } };
  if (queryParams.resolved == "true") {
    query.resolved = true;
  }

  const commentsOptions = {
    transform: function(comment) {
      comment.entry = Entries.findOne(comment.entryId);
      comment.person = People.findOne({
        facebookId: comment.personId,
        campaignId: props.campaignId
      });
      return comment;
    }
  };

  let commentsQuery = {
    ...query,
    facebookAccountId: { $in: facebookIds },
    created_time: { $exists: true }
  };
  if (queryParams.message_tags) {
    commentsQuery.message_tags = { $exists: true };
  }
  if (queryParams.categories) {
    commentsQuery.categories = { $in: [queryParams.categories] };
  }
  const comments = commentsHandle.ready()
    ? Comments.find(commentsQuery, commentsOptions).fetch()
    : [];

  return {
    limit: props.limit || 10,
    loading,
    comments,
    query
  };
})(CommentsPage);
