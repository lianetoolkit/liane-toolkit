import React, { Component } from "react";
import styled from "styled-components";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
  FormattedHTMLMessage,
} from "react-intl";

const messages = defineMessages({
  mobilize: {
    id: "app.desire_field.mobilize.label",
    defaultMessage: "Mobilize people",
  },
  mobilizeDescription: {
    id: "app.desire_field.mobilize.description",
    defaultMessage:
      "Attract new supporters, meet my followers and increase the level of engagement.",
  },
  territory: {
    id: "app.desire_field.territory.label",
    defaultMessage: "Organization of actions in the territory",
  },
  territoryDescription: {
    id: "app.desire_field.territory.description",
    defaultMessage: "Plan and manage street actions with the support of a map.",
  },
  volunteerDonor: {
    id: "app.desire_field.volunteer_donor.label",
    defaultMessage: "Volunteers and Donors",
  },
  volunteerDonorDescription: {
    id: "app.desire_field.volunteer_donor.description",
    defaultMessage:
      "Identify potential volunteers and donors among my followers and get in touch with them.",
  },
  crm: {
    id: "app.desire_field.crm.label",
    defaultMessage: "Campaign CRM",
  },
  crmDescription: {
    id: "app.desire_field.crm.description",
    defaultMessage: "Grow, centralize and manage the campaign's contact base.",
  },
  socialMedia: {
    id: "app.desire_field.social_media.label",
    defaultMessage: "Social media",
  },
  socialMediaDescription: {
    id: "app.desire_field.social_media.description",
    defaultMessage: "Monitor and respond to comments on networks more quickly.",
  },
});

const Container = styled.ul`
  margin: 0 0 2rem;
  padding: 0 0 2px;
  list-style: none;
  border-radius: 7px;
  border: 1px solid #ddd;
  display: flex;
  flex-wrap: wrap;
  padding: 0.5rem;
  li {
    flex: 1 1 40%;
    margin: 0.5rem;
    padding: 0;
    border: 1px solid #ddd;
    border-radius: 7px;
    display: flex;
    &.clear {
      border: 0;
    }
    a {
      flex: 1 1 100%;
      padding: 0.8rem 1.2rem;
      border-radius: 7px;
      margin: 0;
      color: #666;
      cursor: default;
      display: block;
      text-decoration: none;
      display: flex;
      justify-content: center;
      flex-direction: column;
      span.title {
        display: block;
        font-weight: 600;
        color: #333;
      }
    }
    &.disabled {
      a > span {
        color: #999;
      }
    }
    &:not(.disabled) {
      a {
        cursor: pointer;
      }
      a:focus,
      a:hover {
        background-color: #fff;
        color: #333;
      }
      a:active {
        background-color: #330066;
        span,
        span.title {
          color: #fff;
        }
      }
      &.selected {
        a {
          background-color: #330066;
          span,
          span.title {
            color: #fff;
          }
        }
      }
    }
  }
  .not-found {
    color: #999;
    font-style: italic;
    margin: 0;
    padding: 0.8rem 1.2rem;
  }
`;

function Item({ title, description, selected, onClick }) {
  let className = "";
  if (selected) className += " selected";
  if (!title || !description) {
    return <li className="clear" />;
  }
  return (
    <li className={className}>
      <a href="#" onClick={onClick}>
        <span className="title">{title}</span>
        <span>{description}</span>
      </a>
    </li>
  );
}

class DesireField extends Component {
  _handleClick = (option) => (ev) => {
    ev.preventDefault();
    const { name, value, onChange } = this.props;
    let result;
    if (value && value.length) {
      const index = value.findIndex((item) => item == option.key);
      if (index != -1) {
        result = [...value];
        result.splice(index, 1);
      } else {
        result = [...value, option.key];
      }
    } else {
      result = [option.key];
    }
    onChange && onChange({ target: { name, value: result } });
  };
  render() {
    const { intl, value } = this.props;
    const options = [
      {
        key: "mobilize",
        title: intl.formatMessage(messages.mobilize),
        description: intl.formatMessage(messages.mobilizeDescription),
      },
      {
        key: "territory",
        title: intl.formatMessage(messages.territory),
        description: intl.formatMessage(messages.territoryDescription),
      },
      {
        key: "volunteer_donor",
        title: intl.formatMessage(messages.volunteerDonor),
        description: intl.formatMessage(messages.volunteerDonorDescription),
      },
      {
        key: "crm",
        title: intl.formatMessage(messages.crm),
        description: intl.formatMessage(messages.crmDescription),
      },
      {
        key: "social_media",
        title: intl.formatMessage(messages.socialMedia),
        description: intl.formatMessage(messages.socialMediaDescription),
      },
    ];
    return (
      <Container>
        {options.map((option) => (
          <Item
            key={option.key}
            title={option.title}
            description={option.description}
            selected={value && value.find((item) => item == option.key)}
            onClick={this._handleClick(option)}
          />
        ))}
        {options.length % 2 != 0 ? <Item /> : null}
      </Container>
    );
  }
}

DesireField.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(DesireField);
