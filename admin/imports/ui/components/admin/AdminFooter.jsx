import React, { Component } from "react";
import { Header } from "semantic-ui-react";

if (!Meteor.isTest) {
  require("./AdminFooter.less");
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
          <Header as="h4" size="tiny">
            {Meteor.settings.public.appName}
            <Header.Subheader>
              Copyright © 2017 . Made with love by{" "}
              <a href="http://www.mkn.media" target="_blank">
                MKN.media
              </a>
            </Header.Subheader>
          </Header>
        </div>
      </footer>
    );
  }
}
