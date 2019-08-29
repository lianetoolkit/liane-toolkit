import React, { Component } from "react";

import Nav from "./Nav.jsx";
import Form from "../../../components/Form.jsx";
import Loading from "../../../components/Loading.jsx";

export default class CampaignActionsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
  }
  _handleClick = ev => {
    ev.preventDefault();
    const { campaignId } = this.props;
    if (
      confirm("Are you sure you'd like to permanently remove your campaign?")
    ) {
      this.setState({ loading: true });
      Meteor.call("campaigns.remove", { campaignId }, (err, data) => {
        this.setState({ loading: false });
        if (err) {
          console.log(err);
        } else {
          FlowRouter.go("App.dashboard");
        }
      });
    }
  };
  render() {
    const { loading } = this.state;
    const { campaign } = this.props;
    if (loading) {
      return <Loading />;
    }
    if (campaign) {
      return (
        <>
          <Nav campaign={campaign} />
          <Form onSubmit={ev => ev.preventDefault()}>
            <Form.Content>
              <button className="delete" onClick={this._handleClick}>
                Remove campaign and all its data
              </button>
              <hr />
              <p>
                <strong>Attention</strong>: This action is irreversible!
              </p>
            </Form.Content>
          </Form>
        </>
      );
    }
    return null;
  }
}
