import React from "react";
import { Form, Select } from "semantic-ui-react";

export default class PeopleTagsField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      options: []
    };
  }
  componentDidMount() {
    let { campaignId } = this.props;
    campaignId = campaignId || FlowRouter.getParam("campaignId");
    Meteor.call("people.getTags", { campaignId }, (err, res) => {
      this.setState({
        options: (res || []).map(item => {
          return {
            key: item._id,
            value: item._id,
            text: item.name
          };
        })
      });
    });
  }
  _handleAddItem = (ev, data) => {
    ev.preventDefault();
    let { campaignId } = this.props;
    const { options } = this.state;
    campaignId = campaignId || FlowRouter.getParam("campaignId");
    Meteor.call(
      "people.createTag",
      { name: data.value, campaignId },
      (err, res) => {
        if (!err) {
          this.setState({
            options: [
              {
                key: res,
                value: res,
                text: data.value
              },
              ...options
            ]
          });
        }
      }
    );
  };
  render() {
    const { value, ...props } = this.props;
    const { loading, options } = this.state;
    return (
      <Form.Field
        control={Select}
        search
        multiple
        disabled={loading}
        allowAdditions={true}
        onAddItem={this._handleAddItem}
        fluid
        options={options}
        additionLabel="Create tag: "
        value={value || []}
        {...props}
      />
    );
  }
}
