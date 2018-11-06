import React from "react";
import { Form, Select } from "semantic-ui-react";

export default class CommentCategoryField extends React.Component {
  static defaultProps = {
    question: "Question",
    vote: "Vote statement"
  };
  constructor(props) {
    super(props);
  }
  render() {
    const { commentId } = this.props;
    return null;
  }
}
