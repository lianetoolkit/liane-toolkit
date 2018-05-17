import React from "react";
import { Modal, Form, Select, Input, Button } from "semantic-ui-react";

const fields = {
  name: {
    label: "Name",
    suggestions: ["name", "fullname", "full name"]
  },
  "campaignMeta.contact.email": {
    label: "Email",
    suggestions: ["email", "e mail", "email address", "e mail address"]
  },
  "campaignMeta.basic_info.age": {
    label: "Age",
    suggestions: ["age"]
  },
  "campaignMeta.basic_info.gender": {
    label: "Gender",
    suggestions: ["gender"]
  },
  "campaignMeta.basic_info.occupation": {
    label: "Job/Occupation",
    suggestions: ["job", "occupation"]
  }
};

class ItemConfig extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: null
    };
    this._handleChange = this._handleChange.bind(this);
  }
  componentDidMount() {
    const { header } = this.props;
    this.setState({
      value: this._getSuggestion()
    });
  }
  componentDidUpdate() {
    const { header, onChange } = this.props;
    const { value } = this.state;
    if (onChange) {
      onChange(null, { name: header, value });
    }
  }
  _getSuggestion() {
    const { header } = this.props;
    let field = "";
    if (header) {
      for (const key in fields) {
        if (
          fields[key].suggestions.indexOf(
            header
              .toLowerCase()
              .replace("-", " ")
              .replace("_", " ")
          ) !== -1
        ) {
          field = key;
        }
      }
    }
    return field;
  }
  _handleChange(ev, { name, value }) {
    this.setState({ value });
  }
  _getOptions() {
    let keys = Object.keys(fields);
    let options = keys.map(k => {
      return {
        key: k,
        text: fields[k].label,
        value: k
      };
    });
    options.push({
      key: "custom",
      text: "Custom",
      value: "custom"
    });
    return options;
  }
  render() {
    const { header } = this.props;
    const { value } = this.state;
    const suggestion = this._getSuggestion();
    return (
      <Form.Group widths="equal">
        <Form.Field control={Input} disabled value={header} />
        <Form.Field
          placeholder="Skip"
          control={Select}
          value={value || suggestion}
          options={this._getOptions()}
          onChange={this._handleChange}
        />
      </Form.Group>
    );
  }
}

export default class PeopleImport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    };
    this._handleChange = this._handleChange.bind(this);
    this._handleModalOpen = this._handleModalOpen.bind(this);
    this._handleModalClose = this._handleModalClose.bind(this);
  }
  componentDidMount() {
    const { data } = this.props;
    if (data && data.length) {
      this.setState({ data });
    }
  }
  componentWillReceiveProps(nextProps) {
    const { data } = nextProps;
    if (data && data.length) {
      this.setState({ data });
    }
  }
  _handleChange(ev, { name, value }) {
    console.log({ name, value });
  }
  _handleModalOpen() {}
  _handleModalClose() {
    if (confirm("Are you sure you'd like to cancel import?")) {
      this.setState({
        data: []
      });
    }
  }
  _getHeaders() {
    const { data } = this.props;
    if (data && data.length) {
      return Object.keys(data[0]);
    }
    return [];
  }
  _handleSubmit(ev) {
    ev.preventDefault();
  }
  render() {
    const { data } = this.state;
    const headers = this._getHeaders();
    return (
      <Modal
        onOpen={this._handleModalOpen}
        onClose={this._handleModalClose}
        open={!!(data && data.length)}
      >
        <Modal.Header>Import people</Modal.Header>
        <Modal.Content>
          <p>Associate your sheet columns to CRM data</p>
          <Form onSubmit={this._handleSubmit}>
            {headers.map((header, i) => (
              <ItemConfig
                key={i}
                header={header}
                onChange={this._handleChange}
              />
            ))}
            <Button primary fluid>
              Start import
            </Button>
          </Form>
        </Modal.Content>
      </Modal>
    );
  }
}
