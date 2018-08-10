import React from "react";
import styled from "styled-components";
import { Menu, Form, Input, Radio } from "semantic-ui-react";

const Wrapper = styled.div`
  .ui.form .ui.menu .fields {
    margin: 0;
  }
`;

export default class ActivityFilter extends React.Component {
  constructor(props) {
    super(props);
    this._handleChange = this._handleChange.bind(this);
  }
  _handleChange(ev, { name, value }) {
    FlowRouter.setQueryParams({ [name]: value });
  }
  render() {
    const query = {
      type: "all",
      resolved: false,
      ...FlowRouter.current().queryParams
    };
    return (
      <Wrapper>
        <Form>
          <Menu>
            <Menu.Item>
              <Form.Group>
                <Form.Field
                  control={Radio}
                  label="All interactions"
                  name="type"
                  value="all"
                  checked={query.type == "all"}
                  onChange={this._handleChange}
                />
                <Form.Field
                  control={Radio}
                  label="Comments"
                  name="type"
                  value="comment"
                  checked={query.type == "comment"}
                  onChange={this._handleChange}
                />
                <Form.Field
                  control={Radio}
                  label="Reactions"
                  name="type"
                  value="reaction"
                  checked={query.type == "reaction"}
                  onChange={this._handleChange}
                />
              </Form.Group>
            </Menu.Item>
            <Menu.Item>
              <Form.Group>
                <Form.Field
                  control={Radio}
                  label="Open activities"
                  name="resolved"
                  value="false"
                  checked={query.resolved == "false"}
                  onChange={this._handleChange}
                />
                <Form.Field
                  control={Radio}
                  label="Resolved activities"
                  name="resolved"
                  value="true"
                  checked={query.resolved == "true"}
                  onChange={this._handleChange}
                />
              </Form.Group>
            </Menu.Item>
          </Menu>
        </Form>
      </Wrapper>
    );
  }
}
