import React from "react";
import Page from "/imports/ui2/components/Page.jsx";
import Loading from "/imports/ui2/components/Loading.jsx";
// import { summaryData } from '../../api/dashboard/server/dashboardMethods';

class DashboardDemoPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      summaryData: null
    };
  }
  componentDidMount() {
    // Call methods here
    const { campaign } = this.props;
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

  }
  render() {
    const { campaign } = this.props;
    const { loading, summaryData } = this.state;
    if (loading) {
      return <Loading full />;
    }
    return (
      <Page.Content>
        <h2>#{campaign._id} - {campaign.name}  Demo Dashboard</h2>
        <pre>summaryData: {JSON.stringify(summaryData)}</pre>
      </Page.Content>
    );
  }
}

export default DashboardDemoPage;
