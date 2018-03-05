import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Canvas } from "/imports/api/canvas/canvas.js";
import CanvasEdit from "/imports/ui/pages/canvas/CanvasEdit.jsx";

export default createContainer(props => {
  const subsHandle = Meteor.subscribe("campaigns.detail", {
    campaignId: props.campaignId
  });
  const canvasHandle = Meteor.subscribe("canvas.byCampaign", {
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
}, CanvasEdit);
