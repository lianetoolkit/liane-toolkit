import React from "react";
import Page from "/imports/ui2/components/Page.jsx";
import Loading from "/imports/ui2/components/Loading.jsx";
class DashboardDemoPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      summaryData: null,
      achievements: null,
      funnelData: null
    };
  }
  componentDidMount() {
    // Call methods here
    const { campaign } = this.props;



    //  Summary Data 

    Meteor.call("dashboard.summary", { campaignId: campaign._id }, (err, data) => {
      if (err) {
        console.log("dashboard.summary error ", err)
        this.setState({
          loading: false,
        });
      } else {
        console.log("dashboard.summary getting summaryData ", data)
        this.setState({ summaryData: data });
      }
    });

    Meteor.call("dashboard.achievements", { campaignId: campaign._id }, (err, data) => {
      if (err) {
        console.log("dashboard.achievements error ", err)
        this.setState({
          loading: false,
        });
      } else {
        console.log("dashboard.achievements getting achievements ", data)
        this.setState({ achievements: data });
      }
    });

    // funnel data
    Meteor.call("dashboard.funnelData", { campaignId: campaign._id }, (err, data) => {
      if (err) {
        console.log("dashboard.funnel error ", err)
        this.setState({
          loading: false,
        });
      } else {
        console.log("dashboard.achievements getting funnelData ", data)
        this.setState({ funnelData: data });
      }
    });


  }
  render() {
    const { campaign } = this.props;
    const { loading, summaryData, achievements, funnelData } = this.state;
    if (loading) {
      return <Loading full />;
    }
    return (
      <Page.Content>
        <h2>#{campaign._id} - {campaign.name}  Demo Dashboard</h2>
        <pre>summaryData: {JSON.stringify(summaryData)}</pre>
        <pre>achievements: {JSON.stringify(achievements)}</pre>
        <pre>funnelData: {JSON.stringify(funnelData)}</pre>
      </Page.Content>
    );
  }
}

export default DashboardDemoPage;
