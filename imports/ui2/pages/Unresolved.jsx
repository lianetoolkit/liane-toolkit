import React, { useState, useCallback } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";
import styled, { css } from "styled-components";

import { Meta } from "../utils/people";
import { alertStore } from "../containers/Alerts.jsx";
import { modalStore } from "../containers/Modal.jsx";

import Button from "../components/Button.jsx";
import Table from "../components/Table.jsx";

import Badge from "../components/Badge.jsx";

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

const messages = defineMessages({
  peopleListTitle: {
    id: "app.people.list.title",
    defaultMessage: "People List",
  },
  namePlaceholder: {
    id: "app.extra_fields.name.placeholder",
    defaultMessage: "Name"
  },
  sourceLabel: {
    id: "app.extra_fields.name.placeholder",
    defaultMessage: "Source"
  },
  phoneLabel: {
    id: "app.people.meta.phone_label",
    defaultMessage: "Phone",
  },
  emailLabel: {
    id: "app.people_form.email_label",
    defaultMessage: "Email",
  },
  unresolvedLabel: {
    id: "app.extra_fields.unresolved.label",
    defaultMessage: "Unresolved",
  },

});


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

const UnresolvedPage = ({ campaignId, people, peopleCounter, intl }) => {
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
                  {intl.formatMessage(messages.peopleListTitle)}
                </Button>
                <Button onClick={() => { }} active={true}>
                  {intl.formatMessage(messages.unresolvedLabel)} {peopleCounter !== 0 ? <Badge>{peopleCounter}</Badge> : ``}
                </Button>
              </Button.Group>
            </FilterMenuGroup>
          </div>
        </PageFilters>
      </Page.Nav>
      <PeopleContent >
        {/* {people.length > 0 ? ( */}
        <PagePaging
          skip={options.skip}
          limit={options.limit}
          count={people.length}
          onNext={() => { }}
          onPrev={() => { }}
        />
        {/* ) : null} */}
        {(people.length == 0) ? (
          <p className="not-found">No results found.</p>
        ) : (
            <UnresolvedTable people={people} campaignId={campaignId} intl={intl}></UnresolvedTable>
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
  .row-container {
    flex-direction: row;
    display: flex;
    justify-content: space-between;
  }
  .unresolved-btn {
    border: 1px solid rgba(51, 0, 102, 0.25);
    text-align: left;
    border-radius: 6px;
    text-decoration: none;
    overflow: hidden;
    padding: 10px 5px;
    display: block;
    font-size: 13px;
    font-weight: normal;
  }
  .col-1/2 {
    width: 45%;
    justify-content: space-between;
  }
  .label {
    color: #333;
    display: block;
    font-size: 0.8em;
    margin-bottom: 0.25rem;
    .idbadge{
      font-weight: normal;
      background-color: #ddd;
      border-radius: 7px;
      padding: 4px 7px;
      font-size: 85%;
    }
  }
  .final-value {
    margin-bottom: 15px;
    text-align: center;
    font-size: 13px;
    line-height: 25px;
    border: 1px solid #ddd;
    border-radius: 7px;
    padding: 5px 10px;
  }
  .header-column {
    font-size: 14px;
    font-weight: bold;
    border: 1px solid #ccc;
    text-align: center;
  }
  .confirm-table {
    width: 100%;
    background: #fff;
    border-spacing: 0;
    border: 1px solid #ddd;
    border-radius: 7px;
    border-collapse: collapse;
    color: #444;
    td {
      border: 1px solid #ddd;
      font-size: 13px;
      text-align: left;
      padding: 5px;
    }
  }
  .field-option {
    word-break: break-all;
    font-weight: normal;
    border: 1px solid #ddd;
    padding: 8px 10px;
    border-radius: 7px;
    font-size: 13px;
    overflow: hidden;

    .value-checkbox {
      flex: 1;
      position: relative;
      left: -10px;
      margin: 0;
    }
  }
`;

const MergeModal = ({ person, campaignId }) => {
  // To force the render
  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  //
  const [view, setView] = useState("list");

  const sections = Meta.getSections();
  //Join the person and its related ones
  let persons = [];
  persons.push(person);
  person.children.map((child) => {
    persons.push(child);
  });
  const counter = persons.length;
  // Adding an extra person for the final column
  const personWidth = `${Math.floor(100 / counter - 1)}%`;

  const [activePersons, setActivePerson] = useState(Array(counter).fill(true));
  const initialValues = {};
  const fieldsToShow = [];
  const sectionsToShow = [];
  const labels = {};
  /* Loop on Sections > Fields > Persons  */
  sections.map((section, i) => {
    const fields = Meta.getList(section);
    fields.map((field) => {
      const { key, name } = Meta.get(section, field);
      let newField = [];
      persons.map((el, index) => {
        let newValue = (value = Object.byString(el, key));
        if (newValue && newField.length == 0) {
          newField.push(newValue);
          labels[key] = Meta.getLabel(section, name).defaultMessage;
          initialValues[key] = {
            person: index,
            value: newValue,
          };
        }
      });
      if (newField.length > 0) {
        fieldsToShow.push(key);
        if (!sectionsToShow.includes(section)) sectionsToShow.push(section);
      }
    });
  });

  const confirm = () => {
    // Setting data
    const data = {
      campaignId,
      remove: [],
      resolve: [],
      update: null
    }

    // Process 
    activePersons.map((state, index) => {
      if (state == false) {
        // Mark as Resolved
        data.resolve.push(persons[index]._id);
      } else {
        // Process to delete or update  
        if (!data.update) {
          oldRelated = persons[index]._id;
          data.update = {
            id: persons[index]._id,
            fields: []
          };
          Object.keys(selectedValues).map((key) => {
            if (selectedValues[key].value == null) return;
            data.update.fields.push({ field: key, id: persons[selectedValues[key].person]._id })
          })
        } else {
          data.remove.push(persons[index]._id);
        }
      }
    })

    // Send

    Meteor.call("people.merge.unresolved", data, (err, res) => {
      if (err) {
        alertStore.add(err);
      } else {
        alertStore.add(null, "success");
        modalStore.reset();
      }
    });


  };

  const [selectedValues, setSelectedValues] = useState(initialValues);

  if (view == "confirm") {
    let oldRelated = null;
    return (
      <Container>
        {/* Check persons  */}
        {activePersons.map((state, index) => {
          if (state == false) {
            return (
              <>
                <div
                  className="label"
                  style={{ marginTop: 10, marginBottom: 10 }}
                >
                  <b>
                    {persons[index].name} <span className="idbadge">#{persons[index]._id}</span>
                  </b>{" "}
                  will be{" "}
                  <Badge>Resolved</Badge>
                </div>
              </>
            );
          } else {
            if (!oldRelated) {
              oldRelated = persons[index]._id;
              return (
                <>
                  <div
                    className="label"
                    style={{ marginTop: 10, marginBottom: 10 }}
                  >
                    <b>
                      {persons[index].name} <span className="idbadge">#{persons[index]._id}</span>
                    </b>{" "}
                    will be <Badge>Updated</Badge> final data
                  </div>
                  <table className="confirm-table">
                    {Object.keys(selectedValues).map((key) => {
                      if (selectedValues[key].value == null) return;
                      return (
                        <tr>
                          <td>{labels[key]}</td>
                          <td>
                            {typeof selectedValues[key].value == "object"
                              ? Object.values(selectedValues[key].value).join(
                                ", "
                              )
                              : selectedValues[key].value}
                          </td>
                        </tr>
                      );
                    })}
                    <tr></tr>
                  </table>
                </>
              );
            } else {
              return (
                <>
                  <div
                    className="label"
                    style={{ marginTop: 10, marginBottom: 10 }}
                  >
                    <b>
                      {persons[index].name} <span className="idbadge">#{persons[index]._id}</span>
                    </b>{" "}
                    will be&nbsp;<Badge>Deleted</Badge>
                  </div>
                </>
              );
            }
          }
        })}

        <div
          className=" row-container"
          style={{ flex: 2, borderTop: "1px solid #ddd", paddingTop: 10 }}
        >
          <a
            href="#"
            className="button secondary"
            style={{ textAlign: "center" }}
            onClick={() => setView("list")}
          >
            Back
          </a>
          <a
            href="#"
            className="button col-1/2"
            style={{ textAlign: "center" }}
            onClick={confirm}
          >
            Confirm
          </a>
        </div>
      </Container>
    );
  }
  return (
    <Container>
      <div>
        <div
          className="row-container"
          style={{
            flex: counter,
          }}
        >
          {persons.map((el, i) => {
            return (
              <div
                style={{
                  width: personWidth,
                }}
              >
                <a
                  href="#"
                  className="unresolved-btn header-column"
                  style={{
                    backgroundColor: activePersons[i] ? "#fc0" : "#fff",
                    color: activePersons[i] ? "#444" : "#330066",
                  }}
                  onClick={(ev) => {
                    ev.preventDefault();
                    let activeList = activePersons;
                    activeList[i] = !activePersons[i];
                    setActivePerson(activeList);

                    let activeSelectedValues = selectedValues;
                    Object.keys(activeSelectedValues).map((field) => {
                      if (
                        activeSelectedValues[field].person == i &&
                        activeList[i] == false
                      ) {
                        activeSelectedValues[field].value = null;
                        activeSelectedValues[field].person = null;
                      }
                    });
                    setSelectedValues(activeSelectedValues);

                    forceUpdate();
                  }}
                >
                  Unresolved #{i + 1} &nbsp;
                  {!activePersons[i] ? <Badge>Resolved</Badge> : ``}
                </a>
              </div>
            );
          })}
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
                  <>
                    <div className="label">{labels[key]}</div>
                    <div
                      className="row-container"
                      style={{
                        flex: counter,
                      }}
                    >
                      {persons.map((el, index) => {
                        const value = Object.byString(el, key);
                        const selected = selectedValues[key].person == index;
                        if (value) {
                          return (
                            <label
                              style={{
                                width: personWidth,
                                opacity: activePersons[index] ? 1 : 0.3,
                              }}
                            >
                              <div
                                className="unresolved-btn"
                                style={{
                                  backgroundColor: selected
                                    ? "#330066"
                                    : "#fff",
                                  color: selected ? "#fff" : "#330066",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() => {
                                    let activeSelectedValues = selectedValues;
                                    if (selected) {
                                      activeSelectedValues[key] = {
                                        person: null,
                                        value: null,
                                      };
                                    } else {
                                      activeSelectedValues[key] = {
                                        person: index,
                                        value: value,
                                      };
                                    }

                                    setSelectedValues(activeSelectedValues);
                                    forceUpdate();
                                  }}
                                  className="value-checkbox"
                                />
                                {typeof value === "object"
                                  ? Object.values(value).join(", ")
                                  : value}
                              </div>
                            </label>
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
                    </div>
                  </>
                );
              })}
            </>
          );
        })}
      </div>
      <div>
        <a
          href="#"
          className="button"
          style={{ textAlign: "center" }}
          onClick={() => setView("confirm")}
        >
          Continue
        </a>
      </div>
    </Container>
  );
};

const UnresolvedTable = ({ people, campaignId, intl }) => {
  const [selected, setSelected] = useState(null);

  const displayPerson = (person) => {
    setSelected(person._id);
    modalStore.setTitle(`Resolve Conflicts with ${person.name}`);
    modalStore.set(<MergeModal person={person} campaignId={campaignId} />);
  };

  return (
    <Container className="people-table">
      {people && people.length ? (
        <Table>
          <thead>
            <tr>
              <th>{intl.formatMessage(messages.namePlaceholder)}</th>
              <th>{intl.formatMessage(messages.phoneLabel)}</th>
              <th>{intl.formatMessage(messages.emailLabel)}</th>
              <th>{intl.formatMessage(messages.sourceLabel)}</th>
              <th>{intl.formatMessage(messages.unresolvedLabel)}</th>
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
                  {person.campaignMeta && person.campaignMeta.contact && person.campaignMeta.contact.cellphone}
                </td>
                <td>
                  {person.campaignMeta && person.campaignMeta.contact && person.campaignMeta.contact.email}
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

export default injectIntl(UnresolvedPage);
