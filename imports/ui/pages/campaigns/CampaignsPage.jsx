import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import Alerts from "/imports/ui/utils/Alerts.js";
import SelectFacebookAccount from "/imports/ui/components/facebook/SelectFacebookAccount.jsx";
import CanvasContainer from "/imports/ui/containers/canvas/CanvasContainer.jsx";

export default class CampaignsPage extends React.Component {
  render() {
    const { campaign } = this.props;
    return <CanvasContainer campaignId={campaign._id} />;
  }
}
