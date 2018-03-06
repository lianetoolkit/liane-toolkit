import React from "react";
import _ from "underscore";
import {
  Grid,
  Form,
  Button,
  Table,
  Dropdown,
  Message
} from "semantic-ui-react";
import FacebookInterestsField from "./FacebookInterestsField.jsx";

const availableTypes = {
  interests: "Interests",
  behaviours: "Behaviours",
  genders: "Genders",
  age_min: "Minimum age",
  age_max: "Maximum age",
  device_platforms: "Device platforms",
  publisher_platforms: "Publisher platforms"
};

export default class AudiencesTargetingSpecForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      availableInterests: {},
      interestSuggestions: [],
      fields: {
        interests: []
      }
    };
    this._handleChange = this._handleChange.bind(this);
    this._newSpecLine = this._newSpecLine.bind(this);
    this._removeSpecLine = this._removeSpecLine.bind(this);
    this._getTypeInput = this._getTypeInput.bind(this);
    this._availableKeys = Object.keys(availableTypes);
  }
  componentDidMount() {
    this.setState({
      fields: Object.assign(
        this.state.fields,
        this._parseIncoming(this.props.value)
      )
    });
  }
  componentDidUpdate(prevProps, prevState) {
    const { fields } = this.state;
    if (JSON.stringify(prevState.fields) != JSON.stringify(fields)) {
      this.props.onChange(null, {
        name: this.props.name,
        value: this._parseOutgoing(fields)
      });
    }
  }
  _handleChange = (e, { name, value }) =>
    this.setState({
      fields: Object.assign({}, this.state.fields, { [name]: value })
    });
  _newSpecLine(type) {
    return ev => {
      ev.preventDefault();
      this.setState({
        fields: Object.assign({}, this.state.fields, { [type]: "" })
      });
    };
  }
  _parseOutgoing(fields) {
    let outgoing = {};
    for (const key in fields) {
      switch (key) {
        case "interests": {
          // outgoing[key] = fields[key].map(v => JSON.parse(v));
          outgoing[key] = fields[key];
          break;
        }
        default: {
          outgoing[key] = fields[key];
        }
      }
    }
    return outgoing;
  }
  _parseIncoming(fields) {
    let incoming = {};
    for (const key in fields) {
      switch (key) {
        case "interests": {
          // incoming[key] = fields[key].map(v => JSON.stringify(v));
          incoming[key] = fields[key];
          break;
        }
        default: {
          incoming[key] = fields[key];
        }
      }
    }
    return incoming;
  }
  _removeSpecLine(type) {
    return ev => {
      ev.preventDefault();
      const { [type]: omit, ...fields } = this.state.fields;
      this.setState({
        fields
      });
    };
  }
  _getTypeInput(key) {
    const { fields } = this.state;
    const props = {
      name: key,
      value: fields[key],
      onChange: this._handleChange
    };
    switch (key) {
      case "interests": {
        const options = Object.values(this.state.availableInterests);
        const { interestSuggestions } = this.state;
        return <FacebookInterestsField {...props} />;
      }
      case "max_age":
      case "min_age": {
        return <Form.Field type="number" {...props} />;
      }
      default: {
        return <Form.Input {...props} />;
      }
    }
  }
  render() {
    const { fields } = this.state;
    const keys = Object.keys(fields);
    return (
      <Grid celled>
        <Grid.Row>
          <Grid.Column width={4}>
            <Button.Group basic vertical labeled icon fluid size="small">
              {this._availableKeys.map(
                (key, i) =>
                  !fields.hasOwnProperty(key) ? (
                    <Button
                      icon="plus"
                      content={availableTypes[key]}
                      key={i}
                      onClick={this._newSpecLine(key)}
                    />
                  ) : null
              )}
            </Button.Group>
          </Grid.Column>
          <Grid.Column width={12}>
            <Table padded>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell colSpan={2}>
                    Selected specifications
                  </Table.HeaderCell>
                  <Table.HeaderCell>Remove</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {keys.map((key, i) => (
                  <Table.Row key={`spec-${key}`}>
                    <Table.Cell collapsing verticalAlign="top">
                      {availableTypes[key]}
                    </Table.Cell>
                    <Table.Cell verticalAlign="top">
                      {this._getTypeInput(key)}
                    </Table.Cell>
                    <Table.Cell collapsing verticalAlign="top">
                      <Button
                        basic
                        size="mini"
                        icon="minus"
                        onClick={this._removeSpecLine(key)}
                      />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}
