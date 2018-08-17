import React from "react";
import styled from "styled-components";
import { Grid, Button, Icon, Modal } from "semantic-ui-react";
import { Alerts } from "/imports/ui/utils/Alerts.js";
import PeopleMetaButtons from "/imports/ui/components/people/PeopleMetaButtons.jsx";
import PeopleFormButton from "/imports/ui/components/people/PeopleFormButton.jsx";
import PeopleInteractivityGrid from "/imports/ui/components/people/PeopleInteractivityGrid.jsx";
import Comment from "/imports/ui/components/entries/Comment.jsx";
import PrivateReply from "/imports/ui/components/people/PrivateReply.jsx";

const Wrapper = styled.div`
  width: 220px;
  p {
    margin: 0 0 1rem;
  }
  .meta-buttons {
    display: block;
    margin-bottom: 0.5rem;
    position: relative;
    z-index: 2;
  }
`;

const InteractivityWrapper = styled.div`
  margin: 1rem 0;
`;

export default class PeopleCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  _goToPerson = () => {
    const { person } = this.props;
    FlowRouter.go("App.campaignPeople.detail", {
      campaignId: person.campaignId,
      personId: person._id
    });
  };
  _canReply(person) {
    const { facebookId } = this.props;
    return (
      person.counts &&
      person.counts[facebookId] &&
      person.counts[facebookId].comments
    );
  }
  _handleModalClose = () => {
    this.setState({
      replying: false,
      replyingComment: null
    });
  };
  _handleReplyClick = person => ev => {
    ev.preventDefault();
    const { facebookId } = this.props;
    const { replying } = this.state;
    if (replying && replying == person._id) {
      this.setState({ replying: false });
    } else {
      this.setState({ loadingReply: true });
      Meteor.call(
        "people.getReplyComment",
        { personId: person._id, facebookAccountId: facebookId },
        (err, res) => {
          if (res && res.comment) {
            this.setState({
              loadingReply: false,
              replying: person._id,
              replyingComment: res.comment,
              defaultReplyMessage: res.defaultMessage
            });
          } else {
            this.setState({
              loadingReply: false
            });
            Alerts.error(
              "There are no comments available for a private reply."
            );
          }
        }
      );
    }
  };
  render() {
    const { onMetaChange, person, facebookId, displayReply } = this.props;
    const { replying, replyingComment, defaultReplyMessage } = this.state;
    if (!person) return null;
    return (
      <Wrapper>
        {person ? <PeopleFormButton floated="right" person={person} /> : null}
        <p>
          <strong>
            <a href="javascript:void(0);" onClick={this._goToPerson}>
              {person.name}
            </a>
          </strong>
        </p>
        <PeopleMetaButtons
          person={person}
          className="meta-buttons"
          onChange={onMetaChange}
        />
        {facebookId ? (
          <InteractivityWrapper>
            <PeopleInteractivityGrid
              person={person}
              facebookId={facebookId}
              columns={3}
            />
          </InteractivityWrapper>
        ) : null}
        {displayReply && facebookId && this._canReply(person) ? (
          <a
            href="javascript:void(0);"
            onClick={this._handleReplyClick(person)}
          >
            <Icon
              name={
                person.receivedAutoPrivateReply
                  ? "checkmark"
                  : "comments outline"
              }
            />{" "}
            Private reply
          </a>
        ) : null}
        <Modal open={!!replying} onClose={this._handleModalClose}>
          <Modal.Header>Private reply</Modal.Header>
          <Modal.Content>
            <Grid widths="equal" columns={2}>
              <Grid.Row>
                <Grid.Column>
                  <Comment comment={replyingComment} />
                </Grid.Column>
                <Grid.Column>
                  <PrivateReply
                    received={person.receivedAutoPrivateReply}
                    personId={person._id}
                    campaignId={person.campaignId}
                    comment={replyingComment}
                    defaultMessage={defaultReplyMessage}
                    onSubmit={() => {
                      this.setState({ replying: false });
                    }}
                  />
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Modal.Content>
        </Modal>
      </Wrapper>
    );
  }
}
