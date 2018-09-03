import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { PeopleLists } from "/imports/api/facebook/people/people.js";
import CampaignsPeople from "/imports/ui/pages/campaigns/CampaignsPeople.jsx";

const PeopleImportsSubs = new SubsManager();

export default withTracker(props => {
  const listsHandle = PeopleImportsSubs.subscribe("peopleLists.byCampaign", {
    campaignId: props.campaignId
  });

  const loading = !listsHandle.ready();

  const lists = listsHandle.ready()
    ? PeopleLists.find({ campaignId: props.campaignId }).fetch()
    : null;

  return {
    loading,
    lists
  };
})(CampaignsPeople);
