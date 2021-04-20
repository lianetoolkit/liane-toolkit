import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { People } from "/imports/api/facebook/people/people.js";
import { Entries } from "/imports/api/facebook/entries/entries.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";
import CommentsPage from "../pages/Comments.jsx";
import { debounce, sortBy } from "lodash";

const CommentsSubs = new SubsManager();

export default withTracker((props) => {
  const queryParams = props.query;

  const facebookId = props.campaign.facebookAccount.facebookId;

  const limit = 10;
  const page = parseInt(props.page || 1);
  const skip = (page - 1) * limit;

  let query = {
    personId: { $nin: [facebookId] },
    created_time: { $exists: true },
    resolved: { $ne: true },
  };

  if (queryParams.q) {
    query.message = new RegExp(queryParams.q.replace(/\W/g, ""), "i");
  }

  if (queryParams.resolved == "true") {
    query.resolved = true;
  }

  if (queryParams.hideReplies) {
    query.parentId = { $exists: false };
  }
  if (queryParams.mention) {
    query.message_tags = { $exists: true };
  }
  if (queryParams.category) {
    query.categories = { $in: [queryParams.category] };
  }
  if (queryParams.unreplied) {
    query.adminReplied = { $ne: true };
    query.parentId = { $exists: false };
  }
  if (queryParams.privateReply) {
    query.can_reply_privately = true;
  }

  if (queryParams.entry) {
    query.entryId = queryParams.entry;
  }

  if (queryParams.source) {
    if (queryParams.source != "facebook") {
      query.source = queryParams.source;
    } else {
      query.source = undefined;
    }
  }

  let commentsHandle, loading;
  let comments = [];

  const commentsOptions = {
    limit,
    skip,
    transform: (comment) => {
      comment.entry = Entries.findOne(comment.entryId);
      comment.person = People.findOne({
        $or: [
          { facebookId: comment.personId },
          { "campaignMeta.social_networks.instagram": `@${comment.personId}` },
        ],
        campaignId: props.campaignId,
      });
      comment.parent = Comments.findOne(comment.parentId);
      comment.adminReplies = Comments.find({
        personId: facebookId,
        parentId: comment._id,
      }).fetch();
      return comment;
    },
  };

  commentsHandle = CommentsSubs.subscribe("comments.byAccount", {
    campaignId: props.campaignId,
    query,
    options: {
      limit: limit + skip,
    },
  });
  loading = !commentsHandle.ready();
  comments = commentsHandle.ready()
    ? Comments.find(query, commentsOptions).fetch()
    : [];
  comments = sortBy(comments, (comment) => -new Date(comment.created_time));

  return {
    loading,
    comments,
    query,
    page,
    limit,
  };
})(CommentsPage);
