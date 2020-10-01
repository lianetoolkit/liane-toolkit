import React, { Component } from "react";
import { FormattedMessage } from "react-intl";

import Grid from "../components/Grid.jsx";
import Intro from "../components/Intro.jsx";
import Title from "../components/Title.jsx";

class DefaultEmail extends Component {
  render() {
    const { title, data } = this.props;
    return (
      <Grid>
        <Intro>
          <FormattedMessage
            id="app.email.intro"
            defaultMessage="Hello, {name}!"
            values={{ name: data.user ? data.user.name : "%NAME%" }}
          />
        </Intro>
        {title ? <Title>{title}</Title> : null}
        <Grid>
          <div dangerouslySetInnerHTML={{ __html: data.content }} />
          <p>
            <a href={Meteor.absoluteUrl(`/messages/${data.messageId}`)}>
              <FormattedMessage
                id="app.email.message_link_text"
                defaultMessage="Click here to access this message in Liane"
              />
            </a>
          </p>
        </Grid>
      </Grid>
    );
  }
}

export default DefaultEmail;
