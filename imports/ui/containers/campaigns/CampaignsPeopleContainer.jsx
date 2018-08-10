import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { People } from "/imports/api/facebook/people/people.js";
import CampaignsPeople from "/imports/ui/pages/campaigns/CampaignsPeople.jsx";

const ImportCountSubs = new SubsManager();

export default withTracker(props => {
  const importCountHandle = ImportCountSubs.subscribe("people.importJobCount", {
    campaignId: props.campaignId
  });

  const loading = !importCountHandle.ready();

  const importCount = importCountHandle.ready()
    ? Counts.get("people.importJobCount")
    : null;

  return {
    loading,
    importCount
  };
})(CampaignsPeople);
