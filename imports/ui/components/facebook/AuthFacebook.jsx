import React from "react";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import i18n from "meteor/universe:i18n";
import PropTypes from "prop-types";
import { Button, Icon, Grid, Header, Divider } from "semantic-ui-react";

export default class AuthFacebook extends React.Component {
  constructor(props) {
    super(props);
  }

  _onClick(event) {
    event.preventDefault();
    Meteor.linkWithFacebook(
      {
        requestPermissions: [
          "user_friends",
          "public_profile",
          "email",
          "manage_pages",
          "pages_show_list",
          "ads_management",
          "ads_read"
        ]
      },
      err => {
        if (err) {
          console.log(err);
        } else {
          Meteor.call('users.exchangeFBToken', (err, data) => {
            if(err) {
              console.log(err);
            }
          });
        }
      }
    );
  }

  render() {
    return (
      <Button color="facebook" onClick={this._onClick}>
        <Icon name="facebook" /> {i18n.__("components.authFacebook.login")}
      </Button>
    );
  }
}
