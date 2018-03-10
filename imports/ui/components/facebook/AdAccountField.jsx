import React from "react";
import { Form, Dropdown } from "semantic-ui-react";

export default class AdAccountField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      adAccounts: []
    };
  }
  componentDidMount() {
    Meteor.call("users.getAdAccounts", null, (error, { result }) => {
      this.setState({ loading: false });
      if (error) {
        console.warn(error);
      } else {
        this.setState({
          adAccounts: result.map(adAcc => ({
            key: adAcc.id,
            value: adAcc.id,
            text: adAcc.account_id
          }))
        });
      }
    });
  }
  render() {
    const { loading, adAccounts } = this.state;
    const { label, name, value, onChange } = this.props;
    return (
      <Form.Field
        control={Dropdown}
        loading={loading}
        selection
        label={label}
        placeholder="Select an ad account"
        options={adAccounts}
        value={value}
        name={name}
        onChange={onChange}
        placeholder="Select an ad account"
      />
    );
  }
}
