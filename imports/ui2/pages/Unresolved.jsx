import React, { useState, useEffect, useCallback } from "react";
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

import { Meta } from "../utils/people";

import { alertStore } from "../containers/Alerts.jsx";
import { modalStore } from "../containers/Modal.jsx";

import PeopleExport from "../components/PeopleExport.jsx";
import Button from "../components/Button.jsx";
import Table from "../components/Table.jsx";

import Badge from "../components/Badge.jsx";
import More from "../components/More.jsx";
import Form from "../components/Form.jsx";
import TagSelect from "../components/TagSelect.jsx";
import SkillsField from "../components/SkillsField.jsx";
import AddressField from "../components/AddressField.jsx";
import ExtraFields from "../components/ExtraFields.jsx";

import Page from "../components/Page.jsx";

import PageFilters from "../components/PageFilters.jsx";
import PagePaging from "../components/PagePaging.jsx";

Object.byString = function (o, s) {
  s = s.replace(/\[(\w+)\]/g, ".$1"); // convert indexes to properties
  s = s.replace(/^\./, ""); // strip a leading dot
  var a = s.split(".");
  for (var i = 0, n = a.length; i < n; ++i) {
    var k = a[i];
    if (k in o) {
      o = o[k];
    } else {
      return;
    }
  }
  return o;
};
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
  .unresolved-btn {
    padding-top: 10px;
    padding-bottom: 10px;
    border: 1px solid rgba(51, 0, 102, 0.25);
    text-align: center;
    border-radius: 6px;
    text-decoration: none;
  }
  .field-option {
    border: 1px solid #ddd;
    padding: 5px 10px;
    border-radius: 7px;
    .input-container {
      border: 0;
      font-size: 14px;
    }
  }
`;

const MergeModal = ({ person }) => {
  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);
  const sections = Meta.getSections();
  let persons = [];
  persons.push(person);
  person.children.map((child) => {
    persons.push(child);
  });
  const counter = persons.length;
  const [activePersons, setActivePerson] = useState(Array(counter).fill(true));
  const personWidth = `${Math.floor(100 / (counter + 1) - 1)}%`;
  const final = {};
  const fieldsToShow = [];
  const sectionsToShow = [];
  // get the content
  sections.map((section, i) => {
    const fields = Meta.getList(section);
    fields.map((field) => {
      const { key } = Meta.get(section, field);
      let newField = [];
      persons.map((el, index) => {
        let newValue = (value = Object.byString(el, key));
        if (newValue) {
          newField.push(newValue);
        }
      });
      if (newField.length > 0) {
        fieldsToShow.push(key);
        if (!sectionsToShow.includes(section)) sectionsToShow.push(section);
      }
    });
  });
  console.log(fieldsToShow);
  return (
    <Container>
      <div>
        <div
          style={{
            flex: counter,
            flexDirection: "row",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {persons.map((el, i) => {
            return (
              <a
                href="#"
                className="unresolved-btn"
                style={{
                  width: personWidth,
                  backgroundColor: activePersons[i] ? "#330066" : "#fff",
                  color: activePersons[i] ? "#fff" : "#330066",
                }}
                onClick={(ev) => {
                  ev.preventDefault();
                  let activeList = activePersons;
                  activeList[i] = !activePersons[i];
                  setActivePerson(activeList);
                  forceUpdate();
                  // return false;
                }}
              >
                Unresolved #{i + 1} &nbsp;
                {!activePersons[i] ? <Badge>Resolved</Badge> : ``}
              </a>
            );
          })}
          <div
            className="unresolved-btn"
            style={{
              width: personWidth,
              backgroundColor: "#fff",
              color: "#330066",
            }}
          >
            Merged Result
          </div>
        </div>
        {sections.map((section, i) => {
          if (!sectionsToShow.includes(section)) return null;
          const fields = Meta.getList(section);
          return (
            <>
              <h3 key={`section-${i}`}>
                {Meta.getSectionLabel(section).defaultMessage}
              </h3>

              {fields.map((field) => {
                const { key, name, type } = Meta.get(section, field);
                if (!fieldsToShow.includes(key)) return null;
                return (
                  <div
                    style={{
                      flex: counter,
                      flexDirection: "row",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    {persons.map((el, index) => {
                      const value = Object.byString(el, key);
                      if (value) {
                        return (
                          <div
                            style={{
                              width: personWidth,
                              marginBottom: 15,
                              opacity: activePersons[index] ? 1 : 0.3,
                            }}
                          >
                            {type == "address" ? (
                              <Form.Field
                                label={
                                  Meta.getLabel(section, name).defaultMessage
                                }
                              >
                                <input
                                  type="text"
                                  name={key}
                                  value={JSON.stringify(value)}
                                  // onChange={}
                                />
                              </Form.Field>
                            ) : null}
                            {type == "string" ? (
                              <Form.Field className="field-option" label={name}>
                                {value}
                              </Form.Field>
                            ) : (
                              ``
                            )}
                          </div>
                        );
                      }
                      return (
                        <div
                          style={{
                            width: personWidth,
                            opacity: activePersons[index] ? 1 : 0.3,
                          }}
                        >
                          &nbsp;
                        </div>
                      );
                    })}
                    <div
                      style={{
                        width: personWidth,
                        marginBottom: 15,
                      }}
                    >
                      {" "}
                      Final State
                    </div>
                  </div>
                );
              })}
            </>
          );
        })}
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
