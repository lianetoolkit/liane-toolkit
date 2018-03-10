import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Canvas } from "/imports/api/canvas/canvas.js";
import CanvasPage from "/imports/ui/pages/canvas/CanvasPage.jsx";

export default createContainer(props => {
  const canvasHandle = Meteor.subscribe("canvas.byCampaign", {
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
}, CanvasPage);
