import React from "react";
import PropTypes from "prop-types";
import AddServiceAccountModal from "/imports/ui/components/modals/AddServiceAccountModal.jsx";

export default class ModalManager extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.context.modalsStore.subscribe(() => this.forceUpdate());
  }

  render() {
    const currentModal = this.context.modalsStore.currentModal;
    const onHide = () => this.context.modalsStore.removeModal();
    // console.log("ModalManager", { currentModal });

    switch (currentModal && currentModal.modalType) {
      case "SERVICEACCOUNTS_CREATE":
        return (
          <AddServiceAccountModal onHide={onHide} {...currentModal.modalData} />
        );
      default:
        return null;
    }
  }
}

ModalManager.contextTypes = { modalsStore: PropTypes.object };
