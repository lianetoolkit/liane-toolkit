import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import Alerts from "/imports/ui/utils/Alerts.js";
import styled from "styled-components";
import PeopleMetaModel from "/imports/api/facebook/people/model/meta";
import FlexDataForm from "/imports/ui/components/flexData/FlexDataForm.jsx";

import {
  Step,
  Rail,
  Sticky,
  Divider,
  Grid,
  Header,
  List,
  Button
} from "semantic-ui-react";

const Wrapper = styled.div`
  .ui.ordered.steps .step:before {
    font-size: 1em;
  }
`;

const Description = styled.div`
  font-size: 1.2em;
  line-height: 1.7em;
  margin: 0 0 2rem 0;
  padding: 1rem 0 2rem 0;
  border-bottom: 1px solid #eee;
  p {
    margin: 0 0 0.5rem;
  }
`;

export default class PeopleEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sectionKey: null
    };
    this._handleSubmit = this._handleSubmit.bind(this);
  }
  componentDidMount() {
    const sectionKey = this.props.sectionKey || PeopleMetaModel[0].key;
    this.setState({
      sectionKey
    });
  }
  componentWillReceiveProps(nextProps) {
    const { sectionKey } = this.props;
    if (nextProps.sectionKey !== sectionKey) {
      this.setState({
        sectionKey: nextProps.sectionKey || PeopleMetaModel[0].key
      });
    }
  }
  _handleContextRef = contextRef => this.setState({ contextRef });
  _handleSubmit(data) {
    const { campaignId, person } = this.props;
    const { sectionKey } = this.state;
    Meteor.call(
      "people.metaUpdate",
      {
        campaignId,
        personId: person._id,
        sectionKey,
        data
      },
      (error, result) => {
        // console.log(result);
      }
    );
  }
  _flexData() {
    const { sectionKey } = this.state;
    const { person } = this.props;
    let data = [];
    if (person.campaignMeta && person.campaignMeta[sectionKey]) {
      for (const key in person.campaignMeta[sectionKey]) {
        data.push({
          key,
          sectionKey,
          value: person.campaignMeta[sectionKey][key]
        });
      }
    }
    return data;
  }
  render() {
    const { sectionKey, contextRef } = this.state;
    const { loading, campaign, person } = this.props;
    const section = PeopleMetaModel.find(section => section.key == sectionKey);
    return (
      <Wrapper>
        <PageHeader
          title={`Campaign: ${campaign ? campaign.name : ""}`}
          titleTo={FlowRouter.path("App.campaignDetail", {
            campaignId: campaign ? campaign._id : ""
          })}
          subTitle={person ? person.name : ""}
        />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <Grid columns={2}>
              <Grid.Row>
                <Grid.Column width={5}>
                  <div className="test">
                    <Sticky
                      offset={20}
                      context={contextRef}
                      // scrollContext={document.getElementById("app-content")}
                    >
                      <Step.Group fluid ordered vertical size="mini">
                        {PeopleMetaModel.map(section => (
                          <Step
                            key={section.key}
                            active={sectionKey == section.key}
                            href={FlowRouter.path("App.campaignPeople.edit", {
                              sectionKey: section.key,
                              personId: person._id,
                              campaignId: campaign._id
                            })}
                          >
                            <Step.Content>
                              <Step.Title>{section.title}</Step.Title>
                            </Step.Content>
                          </Step>
                        ))}
                      </Step.Group>
                    </Sticky>
                  </div>
                </Grid.Column>
                {sectionKey && section ? (
                  <Grid.Column width={11}>
                    <div ref={this._handleContextRef}>
                      {section.description ? (
                        <Description
                          dangerouslySetInnerHTML={{
                            __html: section.description
                          }}
                        />
                      ) : null}
                      <FlexDataForm
                        config={section}
                        data={this._flexData()}
                        onSubmit={this._handleSubmit}
                      />
                    </div>
                  </Grid.Column>
                ) : null}
              </Grid.Row>
            </Grid>
          )}
        </section>
      </Wrapper>
    );
  }
}
