import React from "react";
import Page from "/imports/ui2/components/Page.jsx";
import Loading from "/imports/ui2/components/Loading.jsx";

class DashboardDemoPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }
  componentDidMount() {
    // Call methods here
  }
  render() {
    const { campaign } = this.props;
    const { loading } = this.state;
    if (loading) {
      return <Loading full />;
    }
    return (
      <Page.Content>
        <h2>{campaign.name} Demo Dashboard</h2>
      </Page.Content>
    );
  }
}

export default DashboardDemoPage;
