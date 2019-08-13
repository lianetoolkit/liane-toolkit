import React, { Component } from "react";
import styled from "styled-components";

import OrLine from "../components/OrLine.jsx";
import Form from "../components/Form.jsx";
import Button from "../components/Button.jsx";
import { alertStore } from "../containers/Alerts.jsx";
import { modalStore } from "../containers/Modal.jsx";

const Container = styled.div`
  max-width: 500px;
  margin: 4rem auto;
  padding: 2rem;
  border-radius: 7px;
  border: 1px solid #ddd;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: auto;
  .info {
    flex: 1 1 100%;
    margin: 0 0 3rem;
  }
  h2 {
    font-family: "Open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
    margin: 0 0 0.5rem;
  }
  .account-type {
    color: #666;
    margin: 0 0 3rem;
  }
  .button {
    display: block;
    margin: 0;
  }
  .button.delete {
    border-radius: 7px;
  }
`;

class ConfirmRemove extends Component {
  constructor(props) {
    super(props);
    this.state = { typedEmail: "", valid: false };
  }
  componentDidUpdate(prevProps, prevState) {
    const user = Meteor.user();
    const { typedEmail } = this.state;
    if (prevState.typedEmail != typedEmail) {
      this.setState({
        valid: typedEmail == user.emails[0].address
      });
    }
  }
  _handleSubmit = ev => {
    ev.preventDefault();
    const { onConfirm } = this.props;
    if (this.state.valid) {
      onConfirm && onConfirm();
    }
  };
  render() {
    const { valid } = this.state;
    return (
      <div>
        <p>
          Delete account, campaign and all data associated to this platform, as
          well as revoke previously granted Facebook permissions
        </p>
        <Form.Field label="Type your email to confirm the deletion:">
          <input
            type="text"
            onChange={({ target }) => {
              this.setState({ typedEmail: target.value });
            }}
          />
        </Form.Field>
        <input
          disabled={!valid}
          className="button delete"
          type="submit"
          value="Delete permanently"
          onClick={this._handleSubmit}
        />
      </div>
    );
  }
}

export default class MyAccount extends Component {
  _handleRemoveClick = () => {
    modalStore.setType("small");
    modalStore.set(<ConfirmRemove onConfirm={this._handleRemove} />);
  };
  _handleRemove = () => {
    Meteor.call("users.removeSelf", {}, (err, res) => {
      if (err) {
        alertStore.add(err);
      } else {
        window.location.reload();
      }
    });
  };
  _getAccountTypeLabel = () => {
    const user = Meteor.user();
    switch (user.type) {
      case "campaigner":
        return "Campaigner";
      case "user":
        return "Collaborator";
      default:
        return "Unknown";
    }
  };
  render() {
    const user = Meteor.user();
    return (
      <Container>
        <div className="info">
          <h2>
            Connected as <strong>{user.name}</strong>
          </h2>
          <p className="account-type">
            Account type: <strong>{this._getAccountTypeLabel()}</strong>
          </p>
          <Button primary href={FlowRouter.path("App.campaign.new")}>
            Create a campaign
          </Button>
          <OrLine />
          <p>
            Connect with an existing campaign by forwarding your email to the
            person responsible:
          </p>
          <input type="text" disabled value={user.emails[0].address} />
        </div>
        <a
          href="javascript:void(0);"
          className="button delete"
          onClick={this._handleRemoveClick}
        >
          Click here to delete your account, campaign and all data associated to
          this platform, as well as revoke previously granted Facebook
          permissions.
        </a>
      </Container>
    );
  }
}
