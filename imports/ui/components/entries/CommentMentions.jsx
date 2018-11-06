import React from "react";
import { Label } from "semantic-ui-react";

export default class CommentMentions extends React.Component {
  constructor(props) {
    super(props);
  }
  _getTagIcon(tag) {
    switch (tag.type) {
      case "user":
        return "user";
        break;
      case "event":
        return "calendar";
      case "page":
        return "building";
      default:
        return "";
    }
  }
  render() {
    const { tags } = this.props;
    if (tags && tags.length) {
      return (
        <Label.Group size="mini">
          {tags.map(tag => (
            <Label icon={this._getTagIcon(tag)} detail={tag.name} />
          ))}
        </Label.Group>
      );
    }
    return null;
  }
}
