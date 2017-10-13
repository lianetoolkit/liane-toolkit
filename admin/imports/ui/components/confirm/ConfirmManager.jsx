import React from "react";
import PropTypes from "prop-types";
import { Confirm } from "semantic-ui-react";

export default class ConfirmManager extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.context.confirmStore.subscribe(() => this.forceUpdate());
  }

  render() {
    const { text, open } = this.context.confirmStore;
    const onCancel = () => this.context.confirmStore.hide();
    const onConfirm = () => this.context.confirmStore.callback();

    return (
      <Confirm
        content={text}
        open={open}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );
  }
}

ConfirmManager.contextTypes = { confirmStore: PropTypes.object };
