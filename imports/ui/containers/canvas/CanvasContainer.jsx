import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Canvas } from "/imports/api/canvas/canvas.js";
import CanvasPage from "/imports/ui/pages/canvas/CanvasPage.jsx";

const CanvasSubs = new SubsManager();

export default withTracker(props => {
  const canvasHandle = CanvasSubs.subscribe("canvas.byCampaign", {
    campaignId: props.campaignId
  });

  const loading = !canvasHandle.ready();

  const canvas = canvasHandle.ready()
    ? Canvas.find({ campaignId: props.campaignId }).fetch()
    : null;

  return {
    loading,
    canvas
  };
})(CanvasPage);
