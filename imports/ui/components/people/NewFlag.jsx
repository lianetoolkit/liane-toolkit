import React from "react";
import { Label } from "semantic-ui-react";
import moment from "moment";

export default class PersonNewFlag extends React.Component {
  constructor(props) {
    super(props);
  }
  _isNew() {
    const { person } = this.props;
    const campaign = Session.get("campaign");
    if (!campaign || !campaign.createdAt || !person.createdAt) {
      return null;
    }
    const personDate = moment(person.createdAt);
    const campaignDate = moment(campaign.createdAt);

    if (
      personDate.isAfter(campaignDate.clone().add(2, "days")) &&
      personDate.isAfter(moment().subtract(5, "days"))
    ) {
      return true;
    } else {
      return false;
    }
  }
  render() {
    if (this._isNew()) {
      return (
        <Label basic size="mini" color="red">
          NEW
        </Label>
      );
    }
    return null;
  }
}
