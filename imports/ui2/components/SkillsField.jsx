import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage
} from "react-intl";
import styled from "styled-components";
import { uniq } from "lodash";

import CreatableSelect from "react-select/lib/Creatable";

const messages = defineMessages({
  designLabel: {
    id: "app.skills.design_label",
    defaultMessage: "Design"
  },
  videoLabel: {
    id: "app.skills.video_label",
    defaultMessage: "Video"
  },
  eventProductionLabel: {
    id: "app.skills.event_production_label",
    defaultMessage: "Event production"
  },
  editorLabel: {
    id: "app.skills.editor_label",
    defaultMessage: "Writing/editing"
  },
  photographerLabel: {
    id: "app.skills.photographer_label",
    defaultMessage: "Photography"
  },
  socialMediaLabel: {
    id: "app.skills.social_media_label",
    defaultMessage: "Social media"
  },
  webLabel: {
    id: "app.skills.web_label",
    defaultMessage: "Web development"
  },
  panflationLabel: {
    id: "app.skills.panflation_label",
    defaultMessage: "Panflation"
  }
});

class SkillsField extends Component {
  static defaultOptions = [
    {
      value: "design",
      label: "Design"
    },
    {
      value: "video",
      label: "Video"
    },
    {
      value: "event_production",
      label: "Event production"
    },
    {
      value: "editor",
      label: "Writing/editing"
    },
    {
      value: "photographer",
      label: "Photography"
    },
    {
      value: "social_media",
      label: "Social media"
    },
    {
      value: "web",
      label: "Web Development"
    },
    {
      value: "panflation",
      label: "Panflation"
    }
  ];
  constructor(props) {
    super(props);
    this.state = {
      options: [...this.getOptions()],
      value: []
    };
  }
  getOptions = () => {
    const { intl } = this.props;
    return [
      {
        value: "design",
        label: intl.formatMessage(messages.designLabel)
      },
      {
        value: "video",
        label: intl.formatMessage(messages.videoLabel)
      },
      {
        value: "event_production",
        label: intl.formatMessage(messages.eventProductionLabel)
      },
      {
        value: "editor",
        label: intl.formatMessage(messages.editorLabel)
      },
      {
        value: "photographer",
        label: intl.formatMessage(messages.photographerLabel)
      },
      {
        value: "social_media",
        label: intl.formatMessage(messages.socialMediaLabel)
      },
      {
        value: "web",
        label: intl.formatMessage(messages.webLabel)
      },
      {
        value: "panflation",
        label: intl.formatMessage(messages.panflationLabel)
      }
    ];
  };
  componentDidMount() {
    const { value } = this.props;
    if (value && value.length) {
      this.setState({ value });
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const { name, onChange } = this.props;
    const { value } = this.state;
    if (JSON.stringify(value) != JSON.stringify(prevState.value) && onChange) {
      onChange({ target: { name, value } });
    }
  }
  _handleCreateOption = option => {
    this.setState({
      options: [
        {
          value: option,
          label: option
        },
        ...this.state.options
      ],
      value: uniq([...this.state.value, option])
    });
  };
  _handleChange = options => {
    const { name, onChange } = this.props;
    const value = options.map(option => option.value);
    this.setState({ value });
  };
  _buildValue = () => {
    const { value } = this.state;
    let builtValue = [];
    const defaultOptions = this.getOptions();
    if (value && value.length) {
      for (let val of value) {
        const fromDefault = defaultOptions.find(option => option.value == val);
        builtValue.push({
          value: val,
          label: fromDefault ? fromDefault.label : val
        });
      }
    }
    return builtValue;
  };
  render() {
    const { name } = this.props;
    const { options } = this.state;
    return (
      <CreatableSelect
        classNamePrefix="select-search"
        cacheOptions
        isMulti
        placeholder="Skills..."
        options={options}
        onCreateOption={this._handleCreateOption}
        onChange={this._handleChange}
        name={name}
        value={this._buildValue()}
      />
    );
  }
}

SkillsField.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(SkillsField);
