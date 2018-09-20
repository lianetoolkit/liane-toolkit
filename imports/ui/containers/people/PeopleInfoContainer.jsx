import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { PeopleLists } from "/imports/api/facebook/people/people.js";
import CampaignsPeople from "/imports/ui/pages/campaigns/CampaignsPeople.jsx";

const PeopleInfoSubs = new SubsManager();

export default withTracker(props => {
  return {};
})(CampaignsPeople);
