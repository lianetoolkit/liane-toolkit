import React from "react";
import { Meteor } from "meteor/meteor";
import { Card, Label } from "semantic-ui-react";
import PropTypes from "prop-types";
import UsersChangeRole from "/imports/ui/components/users/utils/UsersChangeRole.jsx";

export default class UsersDetailHeader extends React.Component {
  render() {
    const { user } = this.props;
    return (
      <Card fluid>
        <Card.Content>
          <Card.Header>
            {user.emails[0].address}
          </Card.Header>
          <Card.Meta>
            {user.roles &&
              user.roles.map(role =>
                <Label key={user._id} size="mini">
                  {role}
                </Label>
              )}
          </Card.Meta>
        </Card.Content>
        <Card.Content extra>
          <UsersChangeRole user={user} />
        </Card.Content>
      </Card>
    );
  }
}

UsersDetailHeader.contextTypes = {
  modalsStore: PropTypes.object,
  confirmStore: PropTypes.object
};
