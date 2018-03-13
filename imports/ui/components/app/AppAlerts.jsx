import React from "react";
import { Message, Divider } from "semantic-ui-react";

export default class AppAlerts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._handlePermissionsClick = this._handlePermissionsClick.bind(this);
  }
  componentDidMount() {
    this._validateUser();
  }
  componentWillReceiveProps() {
    this._validateUser();
  }
  _validateUser() {
    const { currentUser } = this.props;
    if (currentUser) {
      const fbData = currentUser.services
        ? currentUser.services.facebook
        : false;
      if (fbData) {
        if (fbData.declined_permissions && fbData.declined_permissions.length) {
          this.setState({
            facebook_permissions: fbData.declined_permissions
          });
        }
      }
    }
  }
  _handlePermissionsClick(ev) {
    ev.preventDefault();
    Meteor.linkWithFacebook(
      {
        requestPermissions: this.state.facebook_permissions
      },
      err => {
        if (err) {
          console.log(err);
        } else {
          Meteor.call("users.exchangeFBToken", (err, data) => {
            location.reload();
            if (err) {
              console.log(err);
            }
          });
        }
      }
    );
  }
  _getAlert(alert) {
    switch (alert) {
      case "facebook_permissions":
        return (
          <span>
            We are missing the following permissions for Liane to work properly:{" "}
            <strong>{this.state[alert].join(", ")}</strong>.
            <br />
            <a href="#" onClick={this._handlePermissionsClick}>
              Click here to authorize
            </a>.
          </span>
        );
      default:
        return null;
    }
  }
  render() {
    const alerts = Object.keys(this.state);
    const { currentUser } = this.props;
    if (alerts && alerts.length) {
      return (
        <div>
          {alerts.map(alert => (
            <div key={alert}>
              <Message error>{this._getAlert(alert)}</Message>
              <Divider hidden />
            </div>
          ))}
        </div>
      );
    } else {
      return null;
    }
  }
}
