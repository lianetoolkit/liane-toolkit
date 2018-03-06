import React from "react";
import { Form, Dropdown, Message, Button } from "semantic-ui-react";

export default class FacebookInterestsField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      availableInterests: {},
      interestSuggestions: [],
      value: []
    };
    this._handleChange = this._handleChange.bind(this);
    this._addInterest = this._addInterest.bind(this);
  }
  componentDidMount() {
    this._updateAvailableInterests(this.props.value || []);
    this.setState({
      value: this._parseValueInput(this.props.value || [])
    });
  }
  componentWillReceiveProps(nextProps) {
    const { value } = this.props;
    if (JSON.stringify(value) !== nextProps.value) {
      this._updateAvailableInterests(nextProps.value || []);
      this.setState({
        value: this._parseValueInput(nextProps.value || [])
      });
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const { value } = this.state;
    const { name, onChange } = this.props;
    if (JSON.stringify(prevState.value) != JSON.stringify(value) && onChange) {
      onChange(null, { name, value: this._parseValueOutput(value) });
    }
  }
  _parseValueInput(value) {
    if (!value) return "";
    if (Array.isArray(value)) {
      return value.map(item => JSON.stringify(item));
    } else {
      return JSON.stringify(value);
    }
  }
  _parseValueOutput(value) {
    if (Array.isArray(value)) {
      return value.map(item => JSON.parse(item));
    } else {
      return JSON.parse(value);
    }
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
        "audienceCategories.searchAdInterests",
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
    const { value } = this.state;
    const interest_list = value.map(interest => JSON.parse(interest).name);
    Meteor.call(
      "audienceCategories.searchAdInterestSuggestions",
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
      const { value, availableInterests } = this.state;
      const option = availableInterests[interest.id];
      this.setState({
        value: [...value, option.value]
      });
    };
  }
  _handleChange = (e, { name, value }) => {
    console.log(name, value);
    this.setState({ value });
  };
  render() {
    const options = Object.values(this.state.availableInterests);
    const { interestSuggestions, value } = this.state;
    return (
      <div>
        <Form.Field
          control={Dropdown}
          placeholder="Search interests..."
          fluid
          multiple
          search
          selection
          onSearchChange={this._searchInterests}
          onChange={this._handleChange}
          options={options}
          value={value}
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
}
