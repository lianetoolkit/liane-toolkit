import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { People } from "/imports/api/facebook/people/people";
import { Comments } from "/imports/api/facebook/comments/comments";
import { Entries } from "/imports/api/facebook/entries/entries";
import PeopleSinglePage from "../pages/PeopleSingle.jsx";

import { get, sortBy } from "lodash";

const PersonSubs = new SubsManager();

export default withTracker((props) => {
  const { personId } = props;
  const facebookId = props.campaign.facebookAccount.facebookId;

  const PersonHandle = PersonSubs.subscribe("people.detail", {
    personId,
  });

  const loading = !PersonHandle.ready();
  let comments = [];
  const person = PersonHandle.ready() ? People.findOne(personId) : null;

  if (person && person.facebookId) {
    let selector = { personId: person.facebookId };
    if (get(person, "campaignMeta.social_networks.instagram")) {
      selector = {
        $or: [
          selector,
          {
            personId: person.campaignMeta.social_networks.instagram.replace(
              "@",
              ""
            ),
          },
        ],
      };
    }
    comments = Comments.find(selector, {
      transform: (comment) => {
        comment.person = person;
        comment.entry = Entries.findOne(comment.entryId);
        comment.parent = Comments.findOne(comment.parentId);
        comment.adminReplies = Comments.find({
          personId: facebookId,
          parentId: comment._id,
        }).fetch();
        return comment;
      },
    }).fetch();
    comments = sortBy(comments, (comment) => -new Date(comment.created_time));
  }

  return {
    loading,
    person,
    comments,
  };
})(PeopleSinglePage);
