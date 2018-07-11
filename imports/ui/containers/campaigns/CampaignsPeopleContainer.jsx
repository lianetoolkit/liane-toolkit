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
  const peopleTagsHandle = CampaignPeopleSubs.subscribe("people.tags", {
    campaignId: props.campaignId
  });

  const loading = !importCountHandle.ready() || !peopleTagsHandle.ready();

  const importCount = importCountHandle.ready()
    ? Counts.get("people.importJobCount")
    : null;

  const tags = peopleTagsHandle.ready()
    ? PeopleTags.find({ campaignId: props.campaignId }).fetch()
    : [];

  return {
    loading,
    importCount,
    tags
  };
})(CampaignsPeople);
