import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { People } from "/imports/api/facebook/people/people.js";
import { Likes } from "/imports/api/facebook/likes/likes.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";
import { Entries } from "/imports/api/facebook/entries/entries.js";
import PeopleSinglePage from "/imports/ui/pages/people/PeopleSinglePage.jsx";

export default withTracker(props => {
  const personHandle = Meteor.subscribe("people.detail", {
    personId: props.personId
  });
  const likesHandle = Meteor.subscribe("likes.byPerson", {
    personId: props.personId,
    campaignId: props.campaignId
  });
  const commentsHandle = Meteor.subscribe("comments.byPerson", {
    personId: props.personId,
    campaignId: props.campaignId
  });

  const entriesOptions = {
    transform: function(item) {
      item.entry = Entries.findOne(item.entryId);
      return item;
    }
  };

  const loading =
    !personHandle.ready() || !likesHandle.ready() || !commentsHandle.ready();

  const person = personHandle.ready() ? People.findOne(props.personId) : null;

  const likes = likesHandle.ready()
    ? Likes.find({}, entriesOptions).fetch()
    : null;
  const comments = commentsHandle.ready()
    ? Comments.find({}, entriesOptions).fetch()
    : null;

  return {
    loading,
    person,
    likes,
    comments
  };
})(PeopleSinglePage);
