import React from "react";
import { Modal, Form, Select, Input, Button, Icon } from "semantic-ui-react";

export default class PeopleMerge extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      people: []
    };
    this._handleModalOpen = this._handleModalOpen.bind(this);
  }
  _getColor() {
    const { duplicates, person } = this.props;
    const match = duplicates.find(p => p.name == person.name);
    if (match && match.count > 1) {
      return match.color;
    } else {
      return "transparent";
    }
  }
  _handleModalOpen() {
    const { campaignId, person } = this.props;
    this.setState({ loading: true });
    Meteor.call(
      "people.findDuplicates",
      { campaignId, personId: person._id },
      (err, res) => {
        console.log(res);
      }
    );
  }
  render() {
    const { person } = this.props;
    return (
      <Modal
        onOpen={this._handleModalOpen}
        trigger={
          <a href="javascript:void(0)">
            <Icon name="warning sign" style={{ color: this._getColor() }} />{" "}
            Merge options
          </a>
        }
      >
        <Modal.Header>Merging {person.name}</Modal.Header>
      </Modal>
    );
  }
}
