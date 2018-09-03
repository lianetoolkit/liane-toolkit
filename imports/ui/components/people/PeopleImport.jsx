import React from "react";
import { Modal, Form, Select, Input, Button, Icon } from "semantic-ui-react";
import PeopleTagsField from "/imports/ui/components/people/PeopleTagsField.jsx";
import PeopleMetaButtons from "/imports/ui/components/people/PeopleMetaButtons.jsx";
import _ from "underscore";

const fields = {
  name: {
    label: "Name",
    suggestions: ["name", "fullname", "full name", "nome"]
  },
  "campaignMeta.contact.email": {
    label: "Email",
    suggestions: ["email", "e mail", "email address", "e mail address"]
  },
  "campaignMeta.social_networks.twitter": {
    label: "Twitter",
    suggestions: ["twitter"]
  },
  "campaignMeta.social_networks.instagram": {
    label: "Instagram",
    suggestions: ["instagram"]
  },
  "campaignMeta.basic_info.gender": {
    label: "Gender",
    suggestions: ["gender"]
  },
  "campaignMeta.basic_info.occupation": {
    label: "Job/Occupation",
    suggestions: ["job", "occupation"]
  },
  "campaignMeta.basic_info.address.zipcode": {
    label: "Address - Zipcode",
    suggestions: ["zipcode", "cep"]
  },
  "campaignMeta.basic_info.address.country": {
    label: "Address - Country",
    suggestions: ["country", "país", "pais"]
  },
  "campaignMeta.basic_info.address.region": {
    label: "Address - Region/State",
    suggestions: ["state", "region", "estado", "uf"]
  },
  "campaignMeta.basic_info.address.city": {
    label: "Address - City",
    suggestions: ["city", "cidade", "municipio", "município"]
  },
  "campaignMeta.basic_info.address.street": {
    label: "Address - Street",
    suggestions: ["address", "street", "rua", "endereço"]
  },
  "campaignMeta.basic_info.address.neighbourhood": {
    label: "Address - Neighbourhood",
    suggestions: ["neighbourhood", "neighborhood", "bairro"]
  },
  "campaignMeta.basic_info.address.number": {
    label: "Address - Number",
    suggestions: ["number", "número", "numero"]
  },
  "campaignMeta.basic_info.address.complement": {
    label: "Address - Complement",
    suggestions: ["complement", "complemento"]
  }
};

class ItemConfig extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: null,
      customField: null
    };
    this._handleChange = this._handleChange.bind(this);
    this._handleCustomChange = this._handleCustomChange.bind(this);
  }
  componentDidMount() {
    const { header } = this.props;
    this.setState({
      value: this._getSuggestion()
    });
  }
  componentDidUpdate(prevProps, prevState) {
    const { header, onChange } = this.props;
    const { value, customField } = this.state;
    if (value !== prevState.value || customField !== prevState.customField) {
      if (onChange) {
        onChange(null, { name: header, value, customField });
      }
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
  _handleCustomChange(ev, { name, value }) {
    this.setState({ customField: value });
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
    options.unshift({
      key: "custom",
      text: "Custom",
      value: "custom"
    });
    options.unshift({
      key: "skip",
      text: "Skip",
      value: "skip"
    });
    return options;
  }
  render() {
    const { header } = this.props;
    const { value, customField } = this.state;
    const suggestion = this._getSuggestion();
    return (
      <Form.Group widths="equal">
        <Form.Field control={Input} disabled value={header} />
        <Form.Field
          placeholder="Skip"
          search
          control={Select}
          value={value || suggestion || "skip"}
          options={this._getOptions()}
          onChange={this._handleChange}
        />
        {value == "custom" ? (
          <Form.Field
            placeholder="Field name"
            control={Input}
            value={customField}
            onChange={this._handleCustomChange}
          />
        ) : null}
      </Form.Group>
    );
  }
}

export default class PeopleImport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      tags: [],
      labels: {}
    };
    this._handleModalOpen = this._handleModalOpen.bind(this);
    this._handleModalClose = this._handleModalClose.bind(this);
    this._handleChange = this._handleChange.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
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
    } else {
      this.setState({ data: [] });
    }
  }
  _handleChange = (ev, { name, value, customField }) => {
    this.setState({
      [name]: {
        value,
        customField
      }
    });
  };
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
  _handleTagChange = (ev, { name, value }) => {
    this.setState({
      tags: value
    });
  };
  _handleMetaButtons = key => {
    this.setState({
      labels: {
        ...this.state.labels,
        [key]: !this.state.labels[key]
      }
    });
  };
  _handleSubmit(ev) {
    ev.preventDefault();
    const { campaignId, filename, onSubmit } = this.props;
    const { data, tags, labels, ...config } = this.state;
    this.setState({
      loading: true
    });
    Meteor.call(
      "people.import",
      {
        campaignId,
        config,
        filename,
        data,
        defaultValues: {
          tags,
          labels
        }
      },
      (err, res) => {
        this.setState({
          loading: false
        });
        if (onSubmit) {
          onSubmit(err, res);
        }
      }
    );
  }
  render() {
    const { data, tags, labels, loading } = this.state;
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
            <PeopleTagsField
              onChange={this._handleTagChange}
              value={tags}
              label="Default tags for this import"
            />
            <Form.Field
              control={PeopleMetaButtons}
              size="big"
              onChange={this._handleMetaButtons}
              active={labels}
              label="Default labels for this import"
            />
            <Button primary fluid disabled={loading} icon>
              <Icon name={loading ? "spinner" : "download"} loading={loading} />{" "}
              Start import
            </Button>
          </Form>
        </Modal.Content>
      </Modal>
    );
  }
}
