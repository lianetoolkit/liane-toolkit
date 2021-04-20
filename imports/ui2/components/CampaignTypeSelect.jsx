import React, { Component } from "react";
import styled from "styled-components";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
  FormattedHTMLMessage,
} from "react-intl";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const SpreadContainer = styled.ul`
  margin: 0 0 2rem;
  padding: 0 0 2px;
  list-style: none;
  border-radius: 7px;
  border: 1px solid #ddd;
  li {
    margin: 2px 2px 0;
    padding: 0;
    a {
      padding: 0.8rem 1.2rem;
      border-radius: 7px;
      margin: 0;
      color: #666;
      display: flex;
      align-items: center;
      text-decoration: none;
      cursor: default;
      > h4 {
        flex: 1 1 100%;
        margin: 0;
        font-size: 1em;
        font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
        font-weight: normal;
      }
      > span {
        flex: 0 0 auto;
        font-size: 0.8em;
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
        color: #fff;
      }
      &.selected {
        a {
          background-color: #330066;
          color: #fff;
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

export const messages = defineMessages({
  placeholder: {
    id: "app.campaign_type_field.placeholder",
    defaultMessage: "Select campaign type",
  },
  electoral: {
    id: "app.campaign_type_field.labels.electoral",
    defaultMessage: "Electoral Campaign",
  },
  mandate: {
    id: "app.campaign_type_field.labels.mandate",
    defaultMessage: "Campaign in a mandate",
  },
  activist: {
    id: "app.campaign_type_field.labels.activist",
    defaultMessage: "Activist Campaign",
  },
});

function Option({ data, selected, onClick }) {
  let className = "";
  if (selected) className += " selected";
  return (
    <li className={className}>
      <a href="#" onClick={onClick}>
        <h4>{data.label}</h4>
        <span>{selected ? <FontAwesomeIcon icon="check" /> : null}</span>
      </a>
    </li>
  );
}

class CampaignTypeSelect extends Component {
  _getOptions = () => {
    const { intl } = this.props;
    return [
      {
        value: "electoral",
        label: intl.formatMessage(messages.electoral),
      },
      {
        value: "mandate",
        label: intl.formatMessage(messages.mandate),
      },
      {
        value: "activist",
        label: intl.formatMessage(messages.activist),
      },
    ];
  };
  _handleChange = (selected) => {
    const { name, onChange } = this.props;
    if (onChange && typeof onChange == "function") {
      onChange({ target: { name, value: selected ? selected.value : null } });
    }
  };
  _getValue = () => {
    const { value } = this.props;
    return this._getOptions().find((option) => option.value == value);
  };
  _handleClick = (option) => (ev) => {
    ev.preventDefault();
    const { name, onChange } = this.props;
    onChange && onChange({ target: { name, value: option.value || null } });
  };
  render() {
    const { intl, name, placeholder, value, clearable, spread } = this.props;
    const options = this._getOptions();
    if (spread) {
      return (
        <SpreadContainer>
          {options.map((option) => (
            <Option
              key={option.value}
              data={option}
              selected={value == option.value}
              onClick={this._handleClick(option)}
            />
          ))}
        </SpreadContainer>
      );
    } else {
      return (
        <Select
          classNamePrefix="select-search"
          options={options}
          isClearable={clearable}
          placeholder={placeholder || intl.formatMessage(messages.placeholder)}
          onChange={this._handleChange}
          name={name}
          value={this._getValue()}
        />
      );
    }
  }
}

CampaignTypeSelect.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CampaignTypeSelect);
