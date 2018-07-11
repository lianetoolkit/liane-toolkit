import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { People, PeopleTags } from "/imports/api/facebook/people/people.js";
import CampaignsPeople from "/imports/ui/pages/campaigns/CampaignsPeople.jsx";

const CampaignPeopleSubs = new SubsManager();

export default withTracker(props => {
  const importCountHandle = CampaignPeopleSubs.subscribe(
    "people.importJobCount",
    {
      campaignId: props.campaignId
    }
  );

  const loading = !importCountHandle.ready();

  const importCount = importCountHandle.ready()
    ? Counts.get("people.importJobCount")
    : null;

  return {
    loading,
    importCount
  };
})(CampaignsPeople);
