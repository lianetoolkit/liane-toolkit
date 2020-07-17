import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage
} from "react-intl";
import styled from "styled-components";

import CreatableSelect from "react-select/creatable";

const messages = defineMessages({
  placeholder: {
    id: "app.campaign.team_roles_field.placeholder",
    defaultMessage: "Select or type to create a new role"
  }
});

export const rolesLabels = defineMessages({
  admin: {
    id: "app.team_roles.admin",
    defaultMessage: "Admin"
  },
  director: {
    id: "app.team_roles.director",
    defaultMessage: "Digital Campaign Director"
  },
  coordinator: {
    id: "app.team_roles.coordinator",
    defaultMessage: "Digital Campaign Coordinator"
  },
  activismCoordinator: {
    id: "app.team_roles.activism_coordinator",
    defaultMessage: "Digital Activism Coordinator"
  },
  activist: {
    id: "app.team_roles.activist",
    defaultMessage: "Digital Activist"
  },
  volunteer: {
    id: "app.team_roles.volunteer",
    defaultMessage: "Volunteer"
  }
});

class TeamRolesField extends Component {
  static defaultOptions = [
    "admin",
    "director",
    "coordinator",
    "activismCoordinator",
    "activist",
    "volunteer"
  ];
  constructor(props) {
    super(props);
    this.state = {
      options: [...this.getOptions()],
      value: undefined
    };
  }
  getOptions = () => {
    const { intl } = this.props;
    let options = [];
    for (const option of TeamRolesField.defaultOptions) {
      options.push({
        value: option,
        label: intl.formatMessage(rolesLabels[option])
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
      value: option
    });
  };
  _handleChange = selectedOption => {
    this.setState({ value: selectedOption.value });
  };
  _buildValue = () => {
    const { value } = this.state;
    if (value) {
      const defaultOptions = this.getOptions();
      const fromDefault = defaultOptions.find(option => option.value == value);
      return {
        value: value,
        label: fromDefault ? fromDefault.label : value
      };
    }
    return undefined;
  };
  render() {
    const { intl, name, placeholder } = this.props;
    const { options } = this.state;
    return (
      <CreatableSelect
        classNamePrefix="select-search"
        cacheOptions
        placeholder={placeholder || intl.formatMessage(messages.placeholder)}
        options={options}
        onCreateOption={this._handleCreateOption}
        onChange={this._handleChange}
        name={name}
        value={this._buildValue()}
      />
    );
  }
}

TeamRolesField.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(TeamRolesField);
