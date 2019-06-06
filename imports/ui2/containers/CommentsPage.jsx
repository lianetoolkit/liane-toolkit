import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { People } from "/imports/api/facebook/people/people.js";
import { Entries } from "/imports/api/facebook/entries/entries.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";
import CommentsPage from "../pages/Comments.jsx";
import { debounce, sortBy } from "lodash";

const CommentsSubs = new SubsManager();

export default withTracker(props => {
  const queryParams = props.query;

  let facebookIds = props.campaign.accounts.map(acc => acc.facebookId);
  if (props.facebookId) {
    facebookIds = [props.facebookId];
  }

  const limit = 10;
  const page = parseInt(props.page || 1);
  const skip = (page - 1) * limit;

  let query = {
    personId: { $nin: facebookIds },
    created_time: { $exists: true },
    resolved: { $ne: true }
  };

  if (queryParams.q) {
    query.message = new RegExp(queryParams.q.replace(/\W/g, ""), "i");
  }

  if (queryParams.resolved == "true") {
    query.resolved = true;
  }

  if (queryParams.message_tags) {
    query.message_tags = { $exists: true };
  }
  if (queryParams.categories) {
    query.categories = { $in: [queryParams.categories] };
  }

  const commentsHandle = CommentsSubs.subscribe("comments.byAccount", {
    campaignId: props.campaignId,
    query,
    options: {
      limit,
      skip
    }
  });

  const loading = !commentsHandle.ready();

  const commentsOptions = {
    limit,
    skip,
    transform: function(comment) {
      comment.entry = Entries.findOne(comment.entryId);
      comment.person = People.findOne({
        facebookId: comment.personId,
        campaignId: props.campaignId
      });
      comment.parent = Comments.findOne(comment.parentId);
      return comment;
    }
  };

  let comments = commentsHandle.ready()
    ? Comments.find(query, commentsOptions).fetch()
    : [];

  comments = sortBy(comments, comment => -new Date(comment.created_time));

  return {
    loading,
    comments,
    query,
    page,
    limit
  };
})(CommentsPage);