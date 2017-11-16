import { FacebookAudiences } from "../audiences.js";
import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";

Meteor.publish("audiences.byCategory.byGeolocation", function({
  facebookAccountId,
  geoLocationId,
  audienceCategoryId
}) {
  const currentUser = this.userId;
  if (currentUser) {
    return FacebookAudiences.find(
      {
        facebookAccountId: facebookAccountId,
        geoLocationId: geoLocationId,
        audienceCategoryId: audienceCategoryId
      },
      { sort: { createdAt: -1 } }
    );
  } else {
    return this.ready();
  }
});

Meteor.publishComposite("audiences.byAccount", function({
  search,
  limit,
  orderBy,
  fields
}) {
  this.unblock();
  // Meteor._sleepForMs 2000
  const currentUser = this.userId;
  if (currentUser) {
    const options = {
      sort: {},
      limit: Math.min(limit, 1000),
      fields
    };
    options["sort"][orderBy.field] = orderBy.ordering;

    return {
      find: function() {
        return FacebookAudiences.find(search, options);
      },
      children: [
        {
          find: function(fbAudience) {
            return AudienceCategories.find(
              {
                _id: fbAudience.audienceCategoryId
              },
              { fields: { title: 1 } }
            );
          }
        },
        {
          find: function(fbAudience) {
            return Geolocations.find(
              {
                _id: fbAudience.geoLocationId
              },
              { fields: { name: 1 } }
            );
          }
        }
      ]
    };
  } else {
    this.stop();
    return;
  }
});

Meteor.publish("audiences.byAccount.counter", function({ search }) {
  this.unblock();
  const currentUser = this.userId;
  if (currentUser) {
    Counts.publish(
      this,
      "audiences.byAccount.counter",
      FacebookAudiences.find(search)
    );
    return;
  } else {
    this.stop();
    return;
  }
});
