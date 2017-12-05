import React from "react";
import _ from "underscore";
import { Form, Button, Table, Dropdown } from "semantic-ui-react";

const availableTypes = {
  age_min: "Minimum age",
  age_max: "Maximum age",
  behaviours: "Behaviours",
  device_platforms: "Device platforms",
  genders: "Genders",
  interests: "Interests",
  publisher_platforms: "Publisher platforms"
};

export default class AudiencesTargetingSpecForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      availableInterests: {},
      fields: {
        interests: []
      }
    };
    this._handleChange = this._handleChange.bind(this);
    this._newSpecLine = this._newSpecLine.bind(this);
    this._getTypeInput = this._getTypeInput.bind(this);
    this._availableKeys = Object.keys(availableTypes);
  }
  componentDidMount() {
    this.setState({
      fields: Object.assign(this.state.fields, this.props.value)
    });
  }
  componentDidUpdate(prevProps, prevState) {
    const { fields } = this.state;
    if (JSON.stringify(prevState.fields) != JSON.stringify(fields)) {
      this.props.onChange(null, {
        name: this.props.name,
        value: fields
      });
    }
    console.log(this.state);
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
  _searchAdInterests = _.debounce((ev, data) => {
    if (data.searchQuery) {
      Meteor.call(
        "facebook.audienceCategories.searchAdInterests",
        { q: data.searchQuery },
        (error, res) => {
          if (error) {
            console.log(error);
          } else {
            let interestsObject = {};
            res.data.forEach(interest => {
              interestsObject[interest.id] = {
                key: interest.id,
                value: JSON.stringify(interest),
                description: `Global size: ${interest.audience_size}`,
                text: interest.name
              };
            });
            this.setState({
              availableInterests: Object.assign(
                {},
                this.state.availableInterests,
                interestsObject
              )
            });
          }
        }
      );
    }
  }, 200);
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
        return (
          <Dropdown
            placeholder="Search interests..."
            fluid
            multiple
            search
            selection
            onSearchChange={this._searchAdInterests}
            options={options}
            {...props}
          />
        );
      }
      case "max_age":
      case "min_age": {
        return <Form.Input type="number" {...props} />;
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
      <div>
        <Table>
          <Table.Body>
            {keys.map((key, i) => (
              <Table.Row key={`spec-${key}`}>
                <Table.Cell>{availableTypes[key]}</Table.Cell>
                <Table.Cell>{this._getTypeInput(key)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        {this._availableKeys.map(
          (key, i) =>
            !fields.hasOwnProperty(key) ? (
              <Button key={i} onClick={this._newSpecLine(key)}>
                Add {availableTypes[key]}
              </Button>
            ) : null
        )}
      </div>
    );
  }
}
