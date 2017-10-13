import React, { Component } from "react";
import PropTypes from "prop-types";
// import { InputGroup, FormControl, Glyphicon } from "react-bootstrap";
import { Icon, Input } from "semantic-ui-react";

export default class SearchBox extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.state = { search: this.props.value };
    this.search = _.debounce(this.search, 700);
  }
  search(query) {
    this.props.search({ search: query });
  }
  onChange(event) {
    this.setState({ search: event.target.value });
    this.search(event.target.value);
  }
  componentDidMount() {
    // console.log("componentDidMount");
    // console.log(this.inputRef);
    this.inputRef.focus();
  }
  render() {
    const { autoFocus } = this.props;
    return (
      <div>
        <Input
          ref={c => {
            this.inputRef = c;
          }}
          icon="search"
          placeholder="Search..."
          onChange={this.onChange}
          defaultValue={this.state.search}
        />
        {/*
        <InputGroup bsSize="sm">
            <FormControl
              type="text"
              value={this.state.search}
              placeholder="Search"
              autoFocus={autoFocus}
              onChange={this.onChange}
            />
            <InputGroup.Addon>
              <Glyphicon glyph="search" />
            </InputGroup.Addon>
          </InputGroup>
        */}
      </div>
    );
    /* <TextField
          name="search"
          hintText="Search"
          value={this.state.search}
          autoFocus = {autoFocus}
          onChange={this.onChange}
        /> */
  }
}
SearchBox.propTypes = {
  autoFocus: PropTypes.bool,
  search: PropTypes.func,
  value: PropTypes.string
};
