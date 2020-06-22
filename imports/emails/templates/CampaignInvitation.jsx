import React, { Component } from "react";
import { FormattedMessage, intlShape, injectIntl } from "react-intl";

import Grid from "../components/Grid.jsx";
import Title from "../components/Title.jsx";
import Button from "../components/Button.jsx";

import { rolesLabels } from "/imports/ui2/components/TeamRolesField.jsx";

class CampaignInvitation extends Component {
  _getRoleText = () => {
    const { intl, data } = this.props;
    if (!data.role) return "%ROLE%";
    if (rolesLabels[data.role])
      return intl.formatMessage(rolesLabels[data.role]);
    return data.role;
  };
  render() {
    const { data } = this.props;
    return (
      <Grid>
        <Title>
          <FormattedMessage
            id="app.email.campaign_invitation.title"
            defaultMessage="{name} invited you to be a part a campaign!"
            values={{ name: data.name ? data.name : "%NAME%" }}
          />
        </Title>
        <p>
          <FormattedMessage
            id="app.email.campaign_invitation.intro"
            defaultMessage="{name} wants you to work with {role} at {campaignName}."
            values={{
              name: data.name ? data.name : "%NAME%",
              role: this._getRoleText(),
              campaignName: data.campaignName
                ? data.campaignName
                : "%CAMPAIGN_NAME"
            }}
          />
        </p>
        <p>
          <FormattedMessage
            id="app.email.campaign_invitation.text"
            defaultMessage="To accept this invitation, register in Liane clicking on the link below."
          />
        </p>
        <Button href={data.url ? data.url : "%URL%"}>
          <FormattedMessage
            id="app.email.campaign_invitation.button_label"
            defaultMessage="Accept invitation"
          />
        </Button>
      </Grid>
    );
  }
}

CampaignInvitation.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(CampaignInvitation);
