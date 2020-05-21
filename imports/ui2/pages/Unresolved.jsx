import React, { Component } from "react";
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

import { alertStore } from "../containers/Alerts.jsx";
import { modalStore } from "../containers/Modal.jsx";

import PeopleExport from "../components/PeopleExport.jsx";
import { PersonImportButton } from "../components/PersonImport.jsx";
import Button from "../components/Button.jsx";
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

const UnresolvedPage = () => {
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
      <PeopleContent>Unresolved Cases</PeopleContent>
    </>
  );
};

UnresolvedPage.propTypes = {
  intl: intlShape.isRequired,
};

export default UnresolvedPage;
