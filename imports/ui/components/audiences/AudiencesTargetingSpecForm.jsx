import React from "react";
import _ from "underscore";
import { Grid, Form, Button, Table, Dropdown, Message } from "semantic-ui-react";

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
    this._addInterest = this._addInterest.bind(this);
    this._availableKeys = Object.keys(availableTypes);
  }
  componentDidMount() {
    this._updateAvailableInterests(this.props.value.interests || []);
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
    if (
      JSON.stringify(prevState.fields.interests) !=
      JSON.stringify(fields.interests)
    ) {
      this._searchInterestSuggestions();
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
          outgoing[key] = fields[key].map(v => JSON.parse(v));
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
          incoming[key] = fields[key].map(v => JSON.stringify(v));
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
  _updateAvailableInterests(data = []) {
    if (!Array.isArray(data)) {
      data = [data];
    }
    if (data.length) {
      let interests = {};
      data.forEach(interest => {
        interests[interest.id] = {
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
          interests
        )
      });
    }
  }
  _searchInterests = _.debounce((ev, data) => {
    if (data.searchQuery) {
      Meteor.call(
        "facebook.audienceCategories.searchAdInterests",
        { q: data.searchQuery },
        (error, res) => {
          if (error) {
            console.log(error);
          } else {
            this._updateAvailableInterests(res.data);
          }
        }
      );
    }
  }, 200);
  _searchInterestSuggestions() {
    const { interests } = this.state.fields;
    const interest_list = interests.map(interest => JSON.parse(interest).name);
    Meteor.call(
      "facebook.audienceCategories.searchAdInterestSuggestions",
      { interest_list },
      (error, res) => {
        if (error) {
          console.log(error);
        } else {
          this._updateAvailableInterests(res.data);
          this.setState({
            interestSuggestions: res.data
          });
        }
      }
    );
  }
  _addInterest(interest) {
    return () => {
      const { fields, availableInterests } = this.state;
      const option = availableInterests[interest.id];
      this.setState({
        fields: Object.assign({}, fields, {
          interests: [...fields.interests, option.value]
        })
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
        return (
          <div>
            <Dropdown
              placeholder="Search interests..."
              fluid
              multiple
              search
              selection
              onSearchChange={this._searchInterests}
              options={options}
              {...props}
            />
            {interestSuggestions.length ? (
              <Message size="mini" attached>
                {interestSuggestions.map(
                  (interest, i) =>
                    i < 4 ? (
                      <Button
                        basic
                        compact
                        size="mini"
                        content={interest.name}
                        key={interest.id}
                        href="javascript:void(0);"
                        onClick={this._addInterest(interest)}
                      />
                    ) : null
                )}
              </Message>
            ) : null}
          </div>
        );
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
