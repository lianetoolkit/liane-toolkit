import React, { Component } from "react";
import { render } from "react-dom";
import { Modal, Button } from "semantic-ui-react";

export default class ModalWrapper extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { title, children, hideHeader, hideFooter } = this.props;
    const size = this.props.size ? this.props.size : "small";
    const onClose = () => this.context.modalsStore.removeModal();
    return (
      <Modal open={true} onClose={onClose} size={size}>
        {!hideHeader ? <Modal.Header>{title}</Modal.Header> : ""}

        <Modal.Content>{children}</Modal.Content>
        {!hideFooter ? (
          <Modal.Actions>
            <Button onClick={onClose}>Close</Button>
          </Modal.Actions>
        ) : (
          ""
        )}
      </Modal>
    );
  }
}

ModalWrapper.contextTypes = { modalsStore: React.PropTypes.object };
