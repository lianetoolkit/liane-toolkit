import React, { Component } from "react";
import { injectIntl, intlShape, defineMessages } from "react-intl";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { get } from "lodash";

import CopyToClipboard from "./CopyToClipboard.jsx";

const messages = defineMessages({
  copy: {
    id: "app.people.social_icons.data_copy",
    defaultMessage: "{data} (copy)",
  },
  instagramLink: {
    id: "app.people.social_icons.instagram_link_text",
    defaultMessage: "View Instagram",
  },
  twitterLink: {
    id: "app.people.social_icons.twitter_link_text",
    defaultMessage: "View Twitter",
  },
});

const Container = styled.div`
  a {
    display: inline-block;
    margin: 0 0.1rem;
    opacity: 0.15;
    width: 22px;
    height: 22px;
    line-height: 22px;
    text-align: center;
    cursor: default;
    &.active {
      opacity: 1;
      cursor: pointer;
      &:hover,
      &:focus {
        color: #f60;
      }
      &.whatsapp {
        border-radius: 100%;
        color: #fff;
        background: #25d366;
      }
      &.facebook {
        color: #3b5998;
      }
      &.instagram {
        color: #dd2a7b;
      }
      &.twitter {
        color: #1da1f2;
      }
    }
  }
`;

class PersonSocialNetworkIcons extends Component {
  constructor(props) {
    super(props);
    this.state = {
      copied: false,
    };
  }
  getMeta(key) {
    const { person } = this.props;
    switch (key) {
      case "social_networks.facebook":
        return (
          person.facebookId &&
          `@${person.facebookId}` != this.getMeta("social_networks.instagram")
        );
      default:
        return person.campaignMeta && get(person.campaignMeta, key);
    }
  }
  render() {
    const { intl, hideMissing, person } = this.props;
    const { copied } = this.state;
    if (person) {
      const facebook = this.getMeta("social_networks.facebook");
      const instagram = this.getMeta("social_networks.instagram");
      const twitter = this.getMeta("social_networks.twitter");
      const instagramProps = {};
      const twitterProps = {};
      if (instagram) {
        instagramProps.href = `https://instagram.com/${instagram.replace(
          "@",
          ""
        )}`;
        instagramProps.rel = "external";
        instagramProps.target = "_blank";
      }
      if (twitter) {
        twitterProps.href = `https://twitter.com/${twitter.replace("@", "")}`;
        twitterProps.rel = "external";
        twitterProps.target = "_blank";
      }
      return (
        <Container>
          <CopyToClipboard
            disabled={true}
            className={facebook ? "facebook active" : "facebook"}
            data-tip={null}
            data-for={`person-contact-icons-${person._id}`}
          >
            <FontAwesomeIcon icon={["fab", "facebook-square"]} />
          </CopyToClipboard>
          <a
            {...instagramProps}
            text={instagram}
            className={instagram ? "instagram active" : "instagram"}
            data-tip={
              instagram ? intl.formatMessage(messages.instagramLink) : null
            }
            data-for={`person-contact-icons-${person._id}`}
          >
            <FontAwesomeIcon icon={["fab", "instagram"]} />
          </a>
          <a
            {...twitterProps}
            text={twitter}
            className={twitter ? "twitter active" : "twitter"}
            data-tip={twitter ? intl.formatMessage(messages.twitterLink) : null}
            data-for={`person-contact-icons-${person._id}`}
          >
            <FontAwesomeIcon icon={["fab", "twitter"]} />
          </a>
        </Container>
      );
    } else {
      return null;
    }
  }
}

PersonSocialNetworkIcons.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(PersonSocialNetworkIcons);
