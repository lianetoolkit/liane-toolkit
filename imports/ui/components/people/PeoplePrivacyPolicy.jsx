import React from "react";
import { Modal } from "semantic-ui-react";
import ReactMarkdown from "react-markdown";

export default class PeoplePrivacyPolicy extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    Meteor.call("options.get", { name: "privacy_policy" }, (err, res) => {
      if (!err && res) {
        this.setState({
          policy: res
        });
      }
    });
  }
  _handleClick = () => {
    this.setState({ active: true });
  };
  _handleClose = () => {
    this.setState({ active: false });
  };
  render() {
    const { active, policy } = this.state;
    if (policy) {
      return (
        <>
          <p>
            <strong>
              Ao enviar este formulário você concorda com nossa{" "}
              <a onClick={this._handleClick} href="javascript:void(0);">
                Política de Privacidade
              </a>.
            </strong>
          </p>
          <Modal onClose={this._handleClose} open={active}>
            <Modal.Header>Política de Privacidade</Modal.Header>
            <Modal.Content>
              <ReactMarkdown source={policy} />
            </Modal.Content>
          </Modal>
        </>
      );
    } else {
      return null;
    }
  }
}
