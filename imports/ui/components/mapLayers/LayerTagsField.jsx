import React from "react";
import { Form, Select } from "semantic-ui-react";

export default class LayerTagsField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      options: []
    };
  }
  componentDidMount() {
    Meteor.call("mapLayers.getTags", {}, (err, res) => {
      this.setState({
        options: res.map(item => {
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
    const { options } = this.state;
    Meteor.call(
      "mapLayers.createTag",
      { name: data.value },
      (err, res) => {
        if (!err) {
          this.setState({
            options: [
              ...options,
              {
                key: res,
                value: res,
                text: data.value
              }
            ]
          });
        }
      }
    );
  };
  render() {
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
        {...this.props}
      />
    );
  }
}
