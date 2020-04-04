import React, { Component } from "react";
import { FormattedMessage, injectIntl, intlShape } from "react-intl";

import Grid from "./Grid.jsx";

const footerStyle = {
  grid: {
    marginTop: "20px"
  },
  paragraph1: {
    fontSize: "12px",
    color: "#777",
    textAlign: "left",
    fontStyle: "italic"
  },
  paragraph2: {
    fontSize: "12px",
    color: "#777",
    textAlign: "right"
  }
};

class Footer extends Component {
  render() {
    return (
      <Grid style={footerStyle.grid}>
        <Grid.Row>
          <p style={footerStyle.paragraph1}>
            <FormattedMessage
              id="app.email.footer.do_not_reply"
              defaultMessage="Do not reply this email"
            />
          </p>
          <p style={footerStyle.paragraph2}>
            <FormattedMessage
              id="app.email.footer.contact_us"
              defaultMessage="Do not hesitate to contact us at {email}!"
              values={{ email: Meteor.settings.public.contactEmail }}
            />
          </p>
        </Grid.Row>
      </Grid>
    );
  }
}

export default Footer;
