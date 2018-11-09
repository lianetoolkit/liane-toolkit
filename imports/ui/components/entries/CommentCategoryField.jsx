import React from "react";
import { Form, Select } from "semantic-ui-react";
import { Alerts } from "/imports/ui/utils/Alerts.js";

export default class CommentCategoryField extends React.Component {
  static defaultProps = {
    options: {
      question: "Question",
      vote: "Vote declaration"
    }
  };
  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
  }
  _getOptions() {
    const { options } = this.props;
    let fieldOptions = [];
    for (let key in options) {
      fieldOptions.push({
        key,
        value: key,
        text: options[key]
      });
    }
    return fieldOptions;
  }
  _handleChange = (ev, { name, value }) => {
    const { comment } = this.props;
    this.setState({
      loading: true
    });
    Meteor.call(
      "comments.updateCategories",
      {
        campaignId: Session.get("campaign")._id,
        commentId: comment._id,
        categories: value
      },
      (err, res) => {
        this.setState({
          loading: false
        });
        if (err) {
          Alerts.error(err);
        } else {
          Alerts.success("Comment updated successfully");
        }
      }
    );
  };
  render() {
    const { comment, options } = this.props;
    return (
      <Form.Field
        control={Select}
        multiple={true}
        basic={true}
        compact={true}
        options={this._getOptions()}
        placeholder="Categorize this comment"
        value={comment.categories || []}
        onChange={this._handleChange}
        loading={this.state.loading}
      />
    );
  }
}
