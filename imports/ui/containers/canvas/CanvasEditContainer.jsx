import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Canvas } from "/imports/api/canvas/canvas.js";
import CanvasEdit from "/imports/ui/pages/canvas/CanvasEdit.jsx";

const CanvasEditSubs = new SubsManager();

export default withTracker(props => {
  const subsHandle = CanvasEditSubs.subscribe("campaigns.detail", {
    campaignId: props.campaignId
  });
  const canvasHandle = CanvasEditSubs.subscribe("canvas.byCampaign", {
    campaignId: props.campaignId
  });

  const loading = !subsHandle.ready() || !canvasHandle.ready();

  const campaign = subsHandle.ready()
    ? Campaigns.findOne(props.campaignId)
    : null;

  const canvas = canvasHandle.ready()
    ? Canvas.find({ campaignId: props.campaignId }).fetch()
    : null;

  return {
    loading,
    campaign,
    canvas
  };
})(CanvasEdit);
