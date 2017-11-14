import { People } from "../people.js";
import { Likes } from "/imports/api/facebook/likes/likes.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";

Meteor.publish("people.byAccount", function({ facebookAccountId }) {
  const currentUser = this.userId;
  if (currentUser) {
    return People.find(
      {
        facebookAccounts: { $in: [facebookAccountId] }
      },
      {
        fields: {
          _id: 1,
          name: 1,
          likesCount: 1,
          facebookAccounts: 1,
          commentsCount: 1
        }
      },
      { sort: { likesCount: -1 } }
    );
  } else {
    return this.ready();
  }
});
