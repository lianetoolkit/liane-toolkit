import React from "react";
import styled from "styled-components";
import { Menu, Form, Input, Radio, Select, Checkbox } from "semantic-ui-react";
import AccountsMenu from "/imports/ui/components/facebook/AccountsMenu.jsx";

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
  _handleCheckboxChange(ev, { name, checked }) {
    FlowRouter.setQueryParams({ [name]: checked ? true : null });
  }
  _handleAccountsClick = (ev, { value }) => {
    const campaign = Session.get("campaign");
    FlowRouter.go("App.campaignPeople.activity", {
      campaignId: campaign._id,
      facebookId: value
    });
  };
  render() {
    const { accounts, facebookId } = this.props;
    const query = {
      type: "all",
      resolved: false,
      ...FlowRouter.current().queryParams
    };
    return (
      <Wrapper>
        <Form>
          <Menu>
            <AccountsMenu
              item
              simple
              accounts={accounts}
              onClick={this._handleAccountsClick}
              selected={facebookId}
              showEmpty={true}
              emptyLabel={"All"}
            />
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
          {query.type == "comment" ? (
            <Menu>
              <Menu.Item>
                <Form.Group>
                  <Form.Field
                    control={Checkbox}
                    name="message_tags"
                    label="Comments with mentions"
                    onChange={this._handleCheckboxChange}
                    checked={!!query.message_tags}
                  />
                  <Form.Field
                    control={Select}
                    name="categories"
                    onChange={this._handleChange}
                    value={query.categories}
                    placeholder="Filter by category"
                    options={[
                      {
                        key: "all",
                        value: "",
                        text: "All"
                      },
                      {
                        key: "question",
                        value: "question",
                        text: "Question"
                      },
                      {
                        key: "vote",
                        value: "vote",
                        text: "Vote declaration"
                      }
                    ]}
                  />
                </Form.Group>
              </Menu.Item>
            </Menu>
          ) : null}
        </Form>
      </Wrapper>
    );
  }
}
