import React, { Component } from "react";
import styled from "styled-components";
import { sortBy } from "lodash";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";

import Button from "./Button.jsx";

const messages = defineMessages({
  addSkillPlaceholder: {
    id: "app.skills_config.add_placeholder",
    defaultMessage: "Type a new skill to add",
  },
  removeSkillLabel: {
    id: "app.skills_config.remove_label",
    defaultMessage: "Remove skill",
  },
});

export const defaultSkillsLabels = defineMessages({
  design: {
    id: "app.skills.design_label",
    defaultMessage: "Design",
  },
  video: {
    id: "app.skills.video_label",
    defaultMessage: "Video",
  },
  event_production: {
    id: "app.skills.event_production_label",
    defaultMessage: "Event production",
  },
  editor: {
    id: "app.skills.editor_label",
    defaultMessage: "Writing/editing",
  },
  photographer: {
    id: "app.skills.photographer_label",
    defaultMessage: "Photography",
  },
  social_media: {
    id: "app.skills.social_media_label",
    defaultMessage: "Social media",
  },
  web: {
    id: "app.skills.web_label",
    defaultMessage: "Web development",
  },
  panflation: {
    id: "app.skills.panflation_label",
    defaultMessage: "Panflation",
  },
});

const Container = styled.div`
  border: 1px solid #ddd;
  border-radius: 7px;
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
    li {
      margin: 0;
      padding: 0;
      display: flex;
      border-bottom: 1px solid #ddd;
      align-items: center;
      justify-content: center;
      label {
        flex: 1 1 100%;
        margin: 0;
        padding: 0.6rem 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #333;
        input[type="checkbox"] {
          margin-right: 1rem;
        }
        &:hover {
          background: #eee;
        }
        .label {
          flex: 1 1 100%;
        }
        .close {
          font-size: 0.8em;
        }
      }
      a {
        flex: 0 0 auto;
        padding: 0.6rem 1rem;
        text-decoration: none;
        color: #cc0000;
        &:hover {
          background: #cc0000;
          color: #fff;
        }
      }
      &:first-child {
        label {
          border-radius: 7px 0 0 0;
        }
        a {
          border-radius: 0 7px 0 0;
        }
      }
    }
  }
  div {
    display: flex;
    align-items: center;
    justify-content: center;
    input {
      flex: 1 1 100%;
      border: 0;
      margin: 0;
      padding: 0.8rem 1rem;
      border-radius: 0 0 0 7px;
    }
    a {
      flex: 0 0 auto;
      border-radius: 0 0 7px 0;
      padding: 1rem;
      margin: 0;
      border: 0;
    }
  }
`;

class SkillsConfig extends Component {
  static defaultOptions = [
    "design",
    "video",
    "event_production",
    "editor",
    "photographer",
    "social_media",
    "web",
    "panflation",
  ];
  constructor(props) {
    super(props);
    this.state = {
      options: [...this.getOptions()],
      value: [],
      newValue: "",
    };
  }
  componentDidUpdate(prevProps, prevState) {
    const { name } = this.props;
    const { options } = this.state;
    if (JSON.stringify(prevState.options) != JSON.stringify(options)) {
      this.props.onChange &&
        this.props.onChange({
          target: { name, value: options },
        });
    }
  }
  getOptions = () => {
    const { intl, value } = this.props;
    let configOptions = [];
    for (const option of value || SkillsConfig.defaultOptions) {
      if (typeof option == "string") {
        configOptions.push({
          label: defaultSkillsLabels[option]
            ? intl.formatMessage(defaultSkillsLabels[option])
            : option,
          value: option,
          active: true,
        });
      } else {
        configOptions.push(option);
      }
    }
    return sortBy(configOptions, (opt) => opt.label);
  };
  _handleRemove = (value) => (ev) => {
    ev.preventDefault();
    const { options } = this.state;
    const newOptions = options.filter((opt) => opt.value != value);
    this.setState({ options: newOptions });
  };
  _handleChange = ({ target }) => {
    this.setState({
      newValue: target.value,
    });
  };
  _handleAdd = (ev) => {
    ev.preventDefault();
    const { options, newValue } = this.state;
    if (!newValue) {
      return;
    }
    if (options.find((option) => option.value == newValue)) return false;
    const newOptions = [
      ...options,
      { value: newValue, label: newValue, active: true },
    ];
    this.setState({
      newValue: "",
      options: sortBy(newOptions, (opt) => opt.label),
    });
  };
  _handleActivation = ({ target }) => {
    const { options } = this.state;
    const newOptions = options.map((option) => {
      if (option.value == target.value) {
        option = { ...option, active: !option.active };
      }
      return option;
    });
    this.setState({ options: newOptions });
  };
  render() {
    const { intl } = this.props;
    const { newValue, options } = this.state;
    return (
      <Container>
        <ul>
          {options.map((option) => (
            <li key={option.value}>
              <label>
                <input
                  type="checkbox"
                  onChange={this._handleActivation}
                  value={option.value}
                  checked={option.active}
                />
                <span className="label">{option.label}</span>
              </label>
              <a
                href="#"
                className="close"
                title={intl.formatMessage(messages.removeSkillLabel)}
                onClick={this._handleRemove(option.value)}
              >
                x
              </a>
            </li>
          ))}
        </ul>
        <div>
          <input
            type="text"
            placeholder={intl.formatMessage(messages.addSkillPlaceholder)}
            value={newValue}
            onKeyPress={(ev) => {
              ev.key == "Enter" && ev.preventDefault();
            }}
            onChange={this._handleChange}
          />
          <Button href="#" secondary onClick={this._handleAdd}>
            <FormattedMessage
              id="app.skills_config.add_label"
              defaultMessage="Add skill"
            />
          </Button>
        </div>
      </Container>
    );
  }
}

SkillsConfig.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(SkillsConfig);
