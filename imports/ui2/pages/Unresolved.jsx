import React, { useState, useEffect } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";
import ReactTooltip from "react-tooltip";
import styled, { css } from "styled-components";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Select from "react-select";
import { get, pick, debounce, defaultsDeep } from "lodash";

import { userCan } from "/imports/ui2/utils/permissions";
import { Meta } from "../utils/people";

import { alertStore } from "../containers/Alerts.jsx";
import { modalStore } from "../containers/Modal.jsx";

import PeopleExport from "../components/PeopleExport.jsx";
import { PersonImportButton } from "../components/PersonImport.jsx";
import Button from "../components/Button.jsx";
import Table from "../components/Table.jsx";

import Badge from "../components/Badge.jsx";
import More from "../components/More.jsx";
import Form from "../components/Form.jsx";
import Page from "../components/Page.jsx";

import PageFilters from "../components/PageFilters.jsx";
import PagePaging from "../components/PagePaging.jsx";
import PeopleTable from "../components/PeopleTable.jsx";
import PeopleHistoryChart from "../components/PeopleHistoryChart.jsx";

// import PersonEdit from "../components/PersonEdit.jsx";

// import PeopleLists from "../components/PeopleLists.jsx";
// import PeopleExports from "../components/PeopleExports.jsx";

import TagFilter from "../components/TagFilter.jsx";
import PersonMetaButtons, {
  labels as categoriesLabels,
} from "../components/PersonMetaButtons.jsx";
import Reaction from "../components/Reaction.jsx";

const PeopleContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: relative;
  .people-nav {
    flex: 0 0 auto;
  }

  .people-table {
    flex: 1 1 100%;
    overflow-x: hidden;
    overflow-y: auto;
    transition: opacity 0.1s linear;
    padding-bottom: 4rem;

    tbody.active {
      border-radius: 0 !important;
      td {
        border-radius: 0 !important;
      }
    }
  }
  .not-found {
    font-size: 1.5em;
    font-style: italic;
    color: #ccc;
    text-align: center;
    margin: 4rem;
  }
`;

const FilterMenuGroup = styled.div`
  .people-tab-menu {
    padding-right: 1rem;
    margin-bottom: 1rem;
    .button:hover,
    .button:focus {
      background-color: rgba(51, 0, 102, 0.5);
      color: #fff;
    }
    .button.active {
      background-color: #330066 !important;
      color: #fff;
    }
  }
`;

const UnresolvedPage = ({ campaignId, people }) => {
  const [loading, setLoading] = useState(true);
  // const [people, setPeople] = useState([]);
  const options = {
    skip: 0,
    limit: 20,
  };
  // useEffect(() => {
  //   fetchPeople();
  // }, []);
  // fetchPeople = debounce(() => {
  //   // const { query, options } = this.state;
  //   console.log(">> fetchPeople");
  //   // FlowRouter.setQueryParams(this.sanitizeQueryParams(query));
  //   // FlowRouter.setQueryParams(
  //   //   this.sanitizeQueryParams(options, ["sort", "order"])
  //   // );
  //   if (loading && campaignId) {
  //     const methodParams = {
  //       campaignId,
  //       query: {
  //         unresolved: true,
  //       },
  //       options: {},
  //     };
  //     Meteor.call("people.search", methodParams, (err, data) => {
  //       if (err) {
  //         // console.log("dataa not found");
  //         setLoading(false);
  //       } else {
  //         setPeople(data);
  //         console.log("dataa found", data);
  //         setLoading(false);
  //       }
  //     });
  //     //   Meteor.call("people.search.count", methodParams, (err, data) => {
  //     //     if (err) {
  //     //       this.setState({
  //     //         loadingCount: false,
  //     //       });
  //     //     } else {
  //     //       this.setState({ count: data, loadingCount: false });
  //     //     }
  //     //   });
  //   }
  // }, 200);
  // fetchPeople();
  // console.log();
  return (
    <>
      <Page.Nav full plain>
        <PageFilters>
          <div className="filters">
            <FilterMenuGroup>
              <Button.Group toggler className="people-tab-menu">
                <Button
                  onClick={() => {
                    FlowRouter.go("App.people");
                  }}
                  active={false}
                >
                  People List
                </Button>
                <Button onClick={() => {}} active={true}>
                  Unresolved <Badge>3</Badge>
                </Button>
              </Button.Group>
            </FilterMenuGroup>
          </div>
        </PageFilters>
      </Page.Nav>
      <PeopleContent loading={loading}>
        {people.length > 0 ? (
          <PagePaging
            skip={options.skip}
            limit={options.limit}
            count={people.length}
            loading={people.length}
            onNext={() => {}}
            onPrev={() => {}}
          />
        ) : null}
        {!loading && (!people || !people.length) ? (
          <p className="not-found">No results found.</p>
        ) : (
          <UnresolvedTable people={people}></UnresolvedTable>
        )}
      </PeopleContent>
    </>
  );
};

const Container = styled.div`
  width: 100%;
  .person-tags {
    margin-left: 1rem;
    font-size: 0.7em;
    svg {
      font-size: 0.8em;
      color: #ccc;
      margin-right: 0.5rem;
    }
    .tag-item {
      background: #f0f0f0;
      color: #666;
      border-radius: 7px;
      padding: 0.2rem 0.4rem;
      margin-right: 0.25rem;
    }
  }
  .extra-actions {
    position: absolute;
    top: 0;
    right: 0;
    font-size: 0.7em;
    background: #fff;
    padding: 1.1rem 0.75rem 0.5rem 0.5rem;
    margin: 0;
    a {
      display: inline-block;
      margin-left: 0.5rem;
      color: #63c;
      &:hover,
      &:active,
      &:focus {
        color: #000;
      }
    }
  }
  .active .extra-actions {
    background: transparent;
    position: static;
    display: block;
    padding: 0;
    margin-bottom: 0.2rem;
    a {
      margin-left: 0;
      margin-right: 0.5rem;
      color: rgba(0, 0, 0, 0.4);
      &:hover,
      &:active,
      &:focus {
        color: #000;
      }
    }
  }
  .active .person-name {
    font-weight: 600;
  }
  .meta-trigger {
    color: rgba(0, 0, 0, 0.25);
    padding: 0 0.5rem;
    &:hover {
      color: #000;
    }
  }
  .person-extra {
    .person-comment-count {
      display: flex;
      text-align: center;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
      border-top: 1px solid #666;
      padding: 0;
      margin: 0;
      .count-label {
        font-size: 1.2em;
        margin: 1rem 1rem 1rem 0;
        svg {
          margin-right: 0.5rem;
        }
      }
      .button {
        text-align: center;
        margin: 1rem 0;
        padding: 0.5rem;
      }
      .latest-comment {
        font-size: 0.9em;
        margin: 1rem 0 1rem 1rem;
      }
    }
  }
`;
const MergeModal = ({ person }) => {
  const sections = Meta.getSections();
  let persons = [];
  persons.push(person);
  person.children.map((child) => {
    persons.push(child);
  });
  const counter = persons.length;
  return (
    <Container>
      <div>
        {sections.map((section, i) => {
          const fields = Meta.getList(section);
          return (
            <>
              <h3 key={`section-${i}`}>
                {Meta.getSectionLabel(section).defaultMessage}
              </h3>

              {fields.map((field) => {
                const { key, name } = Meta.get(section, field);
                // console.log(Meta.getLabel(section, key));
                return (
                  <div
                    style={{
                      flex: counter,
                      flexDirection: "row",
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 15,
                    }}
                  >
                    {persons.map((el) => {
                      console.log(el);
                      return (
                        <div
                          style={{ width: `${Math.floor(100 / counter - 1)}%` }}
                        >
                          <Form.Field label={name}>
                            <input
                              type="text"
                              name={key}
                              value={``}
                              placeholder={name}
                              // onChange={}
                            />
                          </Form.Field>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </>
          );
        })}
        {/* {fields.map((key) => {
          return (
            <Form.Field label={key}>
              <input type="text" name="basic_info.occupation" value={``} />
            </Form.Field>
          );
        })} */}
      </div>
    </Container>
  );
};
const UnresolvedTable = ({ people }) => {
  const [selected, setSelected] = useState(null);

  const displayPerson = (person) => {
    setSelected(person._id);
    modalStore.setTitle(`Resolve Conflicts with ${person.name}`);
    modalStore.set(<MergeModal person={person} />);
  };

  return (
    <Container className="people-table">
      {people && people.length ? (
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Source</th>
              <th>Unresolved</th>
            </tr>
          </thead>

          {people.map((person) => (
            <tbody
              key={person._id}
              className={selected == person._id ? "active" : ""}
            >
              <tr
                id={`table-person-${person._id}`}
                className="interactive"
                onClick={() => displayPerson(person)}
              >
                <td>{person.name}</td>
                <td>
                  {person.campaignMeta && person.campaignMeta.contact.cellphone}
                </td>
                <td>
                  {person.campaignMeta && person.campaignMeta.contact.email}
                </td>
                <td>{person.source && person.source}</td>
                <td> {person.related && person.related.length + 1} </td>
              </tr>
            </tbody>
          ))}
        </Table>
      ) : null}
    </Container>
  );
};

UnresolvedPage.propTypes = {
  intl: intlShape.isRequired,
};

export default UnresolvedPage;
