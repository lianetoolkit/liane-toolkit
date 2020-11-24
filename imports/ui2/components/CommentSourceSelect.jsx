import React, { Component } from "react";
import { injectIntl, intlShape, defineMessages } from "react-intl";
import styled from "styled-components";
import Select from "react-select";

const messages = defineMessages({
  placeholder: {
    id: "app.comment_source_select.placeholder",
    defaultMessage: "Select source..."
  }
});

const Container = styled.div`
  .comment-source-item {
    .message,
    .date {
      display: block;
    }
    .message {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .date {
      font-size: 0.8em;
      color: #666;
    }
  }
`;

class CommentSourceSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      options: ['Facebook','Instagram']
    };
  }
  _handleInputChange = (search, { action }) => {
    if (action == "input-change") {
      this._fetchSearch(search);
    }
  };
  _handleChange = value => {
    const { onChange, name } = this.props;
    if (onChange) {
      onChange({ target: { name, value: value ? value.value : null } });
    }
  };
  _buildValue = () => {
    const { options } = this.state;
    const { value } = this.props;
    if (value && options.length) {
      return options.find(option => option.value == value);
    }
    return null;
  };
  getSourceOptions = () => {
    const { intl, lists } = this.props;
    let options = [
      {
        value: "facebook",
        label: "Facebook",
      },
      {
        value: "instagram",
        label: "Instagram",
      }
    ];
    return options;
  };
  render() {
    const { loading, options } = this.state;
    const { intl, name, value, placeholder } = this.props;
    return (
      <Container>
        <Select
          classNamePrefix="select-search"
          cacheOptions
          isClearable={true}
          placeholder={placeholder || intl.formatMessage(messages.placeholder)}
          options={this.getSourceOptions()}
          onChange={this._handleChange}
          name={name}
          value={this._buildValue()}
        />
      </Container>
    );
  }
}

CommentSourceSelect.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(CommentSourceSelect);
