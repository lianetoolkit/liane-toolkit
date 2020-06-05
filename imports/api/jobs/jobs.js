export const Jobs = new JobCollection("jobs", { noCollectionSuffix: true });

Meteor.startup(() => {
  if (Meteor.isServer) {
    Jobs.rawCollection().createIndex({
      "data.campaignId": 1,
    });
    Jobs.rawCollection().createIndex({
      "data.jobId": 1,
    });
    Jobs.rawCollection().createIndex({
      type: 1,
    });
    Jobs.rawCollection().createIndex({
      status: 1,
    });
  }
});
