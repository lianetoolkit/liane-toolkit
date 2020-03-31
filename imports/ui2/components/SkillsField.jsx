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
  placeholder: {
    id: "app.skills.placeholder",
    defaultMessage: "Skills..."
  }
});

export const skillsLabels = defineMessages({
  design: {
    id: "app.skills.design_label",
    defaultMessage: "Design"
  },
  video: {
    id: "app.skills.video_label",
    defaultMessage: "Video"
  },
  event_production: {
    id: "app.skills.event_production_label",
    defaultMessage: "Event production"
  },
  editor: {
    id: "app.skills.editor_label",
    defaultMessage: "Writing/editing"
  },
  photographer: {
    id: "app.skills.photographer_label",
    defaultMessage: "Photography"
  },
  social_media: {
    id: "app.skills.social_media_label",
    defaultMessage: "Social media"
  },
  web: {
    id: "app.skills.web_label",
    defaultMessage: "Web development"
  },
  panflation: {
    id: "app.skills.panflation_label",
    defaultMessage: "Panflation"
  }
});

class SkillsField extends Component {
  static defaultOptions = [
    "design",
    "video",
    "event_production",
    "editor",
    "photographer",
    "social_media",
    "web",
    "panflation"
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
    let options = [];
    for (const option of SkillsField.defaultOptions) {
      options.push({
        label: skillsLabels[option]
          ? intl.formatMessage(skillsLabels[option])
          : option,
        value: option
      });
    }
    return options;
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
    const { intl, name } = this.props;
    const { options } = this.state;
    return (
      <CreatableSelect
        classNamePrefix="select-search"
        cacheOptions
        isMulti
        placeholder={intl.formatMessage(messages.placeholder)}
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
