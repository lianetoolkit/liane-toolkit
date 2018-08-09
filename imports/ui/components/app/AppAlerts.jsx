import React from "react";
import { Message, Divider } from "semantic-ui-react";
import { difference } from "lodash";

export default class AppAlerts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alerts: {},
      permissions: [
        "public_profile",
        "email",
        "manage_pages",
        "pages_show_list",
        "ads_management",
        "ads_read",
        "business_management",
        "read_page_mailboxes"
      ]
    };
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
    const { permissions } = this.state;
    if (currentUser) {
      const fbData = currentUser.services
        ? currentUser.services.facebook
        : false;
      if (fbData) {
        if (fbData.declined_permissions && fbData.declined_permissions.length) {
          const diff = difference(permissions, fbData.declined_permissions);
          if (diff.length != permissions.length) {
            this.setState({
              alerts: {
                ...this.state.alerts,
                facebook_permissions: permissions
              }
            });
          }
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
    const alerts = Object.keys(this.state.alerts);
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
