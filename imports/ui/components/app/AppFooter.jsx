import React, { Component } from "react";
import { Header, Container } from "semantic-ui-react";

if (!Meteor.isTest) {
  require("./AppFooter.less");
}

export default class AppFooter extends React.Component {
  constructor(props) {
    super(props);
    this.styles = {
      navbar: {
        marginBottom: 0
      }
    };
  }
  render() {
    return (
      <footer id="adminfooter" style={this.props.styles}>
        <div className="footer-inner">
          <Container>
            <Header as="h4" size="tiny">
              {Meteor.settings.public.appName}
              <Header.Subheader>
                Copyleft © 2017 . Made with love around the world
              </Header.Subheader>
            </Header>
          </Container>
        </div>
      </footer>
    );
  }
}
