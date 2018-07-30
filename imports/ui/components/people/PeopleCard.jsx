import React from "react";
import styled from "styled-components";
import PeopleMetaButtons from "/imports/ui/components/people/PeopleMetaButtons.jsx";
import PeopleFormButton from "/imports/ui/components/people/PeopleFormButton.jsx";
import PeopleInteractivityGrid from "/imports/ui/components/people/PeopleInteractivityGrid.jsx";

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

export default class PeopleCard extends React.Component {
  _goToPerson = () => {
    const { person } = this.props;
    FlowRouter.go("App.campaignPeople.detail", {
      campaignId: person.campaignId,
      personId: person._id
    });
  };
  render() {
    const { onMetaChange, person, facebookId } = this.props;
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
          <PeopleInteractivityGrid
            person={person}
            facebookId={facebookId}
            columns={3}
          />
        ) : null}
      </Wrapper>
    );
  }
}
