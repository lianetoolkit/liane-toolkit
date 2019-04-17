import React from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ClientStorage } from "meteor/ostrio:cstorage";
import XLSX from "xlsx";
import Select from "react-select";
import { modalStore } from "../containers/Modal.jsx";
import Form from "./Form.jsx";
import TagSelect from "./TagSelect.jsx";
import PersonMetaButtons from "./PersonMetaButtons.jsx";

const fields = {
  name: {
    label: "Name",
    suggestions: ["name", "fullname", "full name", "nome"]
  },
  "campaignMeta.contact.email": {
    label: "Email",
    suggestions: ["email", "e mail", "email address", "e mail address"]
  },
  "campaignMeta.contact.cellphone": {
    label: "Celular",
    suggestions: ["phone", "cellphone", "celular"]
  },
  "campaignMeta.social_networks.twitter": {
    label: "Twitter",
    suggestions: ["twitter"]
  },
  "campaignMeta.social_networks.instagram": {
    label: "Instagram",
    suggestions: ["instagram"]
  },
  "campaignMeta.basic_info.gender": {
    label: "Gender",
    suggestions: ["gender"]
  },
  "campaignMeta.basic_info.occupation": {
    label: "Job/Occupation",
    suggestions: ["job", "occupation"]
  },
  "campaignMeta.basic_info.address.zipcode": {
    label: "Address - Zipcode",
    suggestions: ["zipcode", "cep"]
  },
  "campaignMeta.basic_info.address.country": {
    label: "Address - Country",
    suggestions: ["country", "país", "pais"]
  },
  "campaignMeta.basic_info.address.region": {
    label: "Address - Region/State",
    suggestions: ["state", "region", "estado", "uf"]
  },
  "campaignMeta.basic_info.address.city": {
    label: "Address - City",
    suggestions: ["city", "cidade", "municipio", "município"]
  },
  "campaignMeta.basic_info.address.street": {
    label: "Address - Street",
    suggestions: ["address", "street", "rua", "endereço"]
  },
  "campaignMeta.basic_info.address.neighbourhood": {
    label: "Address - Neighbourhood",
    suggestions: ["neighbourhood", "neighborhood", "bairro"]
  },
  "campaignMeta.basic_info.address.number": {
    label: "Address - Number",
    suggestions: ["number", "número", "numero"]
  },
  "campaignMeta.basic_info.address.complement": {
    label: "Address - Complement",
    suggestions: ["complement", "complemento"]
  }
};

const ItemConfigContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 0 0 1rem;
  > div {
    flex: 1 1 100%;
    input,
    .select-search__control,
    .select__control {
      width: 100%;
      margin: 0;
    }
  }
  .arrow {
    font-size: 0.8em;
    color: #666;
    flex: 0 0 auto;
    margin: 0 1rem;
  }
  &.header {
    h4 {
      margin: 0;
    }
    .arrow {
      opacity: 0;
    }
  }
  .custom-field-name-input {
    margin-left: 0.5rem;
  }
`;

export class PersonImportButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      importData: null,
      importFilename: ""
    };
  }
  componentDidUpdate(prevProps, prevState) {
    const { importData, importFilename } = this.state;
    if (importFilename != prevState.importFilename && importData) {
      modalStore.setTitle(`Importando ${importFilename}`);
      modalStore.set(
        <PeopleImport
          data={importData}
          filename={importFilename}
          campaignId={Session.get("campaignId")}
          onSubmit={this._handleImporSubmit}
        />
      );
    }
  }
  _handleImportClick = ev => {
    ev.preventDefault();
    this.importInput.click();
  };
  _handleImport = ev => {
    const campaign = ClientStorage.get("campaign");
    this.setState({ loading: true });
    let file = ev.currentTarget.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      let bytes = new Uint8Array(reader.result);
      const wb = XLSX.read(bytes, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      this.setState({ importData: json, importFilename: file.name });
    };
    reader.readAsArrayBuffer(file);
  };
  _handleImportSubmit = (err, res) => {
    if (!err) {
      this.setState({ importData: null });
      // Alerts.success("Import has started");
    } else {
      // Alerts.error(err);
    }
  };
  render() {
    return (
      <>
        <input
          type="file"
          onChange={this._handleImport}
          style={{ display: "none" }}
          ref={input => (this.importInput = input)}
        />
        <a
          {...this.props}
          href="javascript:void(0);"
          onClick={this._handleImportClick}
        >
          Importar planilha
        </a>
      </>
    );
  }
}

class ItemConfig extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: null,
      customField: null
    };
  }
  componentDidMount() {
    const { header } = this.props;
    this.setState({
      value: this._getSuggestion()
    });
  }
  componentDidUpdate(prevProps, prevState) {
    const { header, onChange } = this.props;
    const { value, customField } = this.state;
    if (value !== prevState.value || customField !== prevState.customField) {
      if (onChange) {
        onChange({ name: header, value, customField });
      }
    }
  }
  _getSuggestion() {
    const { header } = this.props;
    let field = "";
    if (header) {
      for (const key in fields) {
        if (
          fields[key].suggestions.indexOf(
            header
              .toLowerCase()
              .replace("-", " ")
              .replace("_", " ")
          ) !== -1
        ) {
          field = key;
        }
      }
    }
    return field;
  }
  _handleSelectChange = selected => {
    let value = null;
    if (selected && selected.value) {
      value = selected.value;
    }
    this.setState({ value });
  };
  _handleCustomChange = ({ target }) => {
    this.setState({ customField: target.value });
  };
  _getOptions() {
    let keys = Object.keys(fields);
    let options = keys.map(k => {
      return {
        label: fields[k].label,
        value: k
      };
    });
    options.unshift({
      label: "Campo customizado",
      value: "custom"
    });
    options.unshift({
      label: "Pular campo",
      value: "skip"
    });
    return options;
  }
  getValue = () => {
    const { value } = this.state;
    const suggestion = this._getSuggestion();
    const options = this._getOptions();
    return options.find(
      option => option.value == (value || suggestion || "skip")
    );
  };
  render() {
    const { header } = this.props;
    const { value, customField } = this.state;
    const suggestion = this._getSuggestion();
    return (
      <ItemConfigContainer>
        <div>
          <input type="text" disabled value={header} />
        </div>
        <span className="arrow">
          <FontAwesomeIcon icon="arrow-right" />
        </span>
        <div>
          <Select
            classNamePrefix="select-search"
            isSearchable={true}
            isClearable={false}
            value={this.getValue()}
            options={this._getOptions()}
            placeholder="Pular"
            onChange={this._handleSelectChange}
          />
        </div>
        {value == "custom" ? (
          <div>
            <input
              type="text"
              className="custom-field-name-input"
              value={customField}
              placeholder="Nome do campo"
              onChange={this._handleCustomChange}
            />
          </div>
        ) : null}
      </ItemConfigContainer>
    );
  }
}

const Container = styled.div`
  .person-meta-buttons {
    margin: 0.5rem 0;
  }
`;

export default class PeopleImport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      tags: [],
      labels: {}
    };
    this._handleModalOpen = this._handleModalOpen.bind(this);
    this._handleModalClose = this._handleModalClose.bind(this);
    this._handleChange = this._handleChange.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
  }
  componentDidMount() {
    const { data } = this.props;
    if (data && data.length) {
      this.setState({ data });
    }
  }
  componentWillReceiveProps(nextProps) {
    const { data } = nextProps;
    if (data && data.length) {
      this.setState({ data });
    } else {
      this.setState({ data: [] });
    }
  }
  _handleChange = ({ name, value, customField }) => {
    this.setState({
      [name]: {
        value,
        customField
      }
    });
  };
  _handleModalOpen() {}
  _handleModalClose() {
    if (confirm("Are you sure you'd like to cancel import?")) {
      this.setState({
        data: []
      });
    }
  }
  _getHeaders() {
    const { data } = this.props;
    if (data && data.length) {
      return Object.keys(data[0]);
    }
    return [];
  }
  _handleTagChange = ({ target }) => {
    this.setState({
      tags: target.value
    });
  };
  _handleMetaButtons = key => {
    this.setState({
      labels: {
        ...this.state.labels,
        [key]: !this.state.labels[key]
      }
    });
  };
  _handleSubmit(ev) {
    ev.preventDefault();
    const { campaignId, filename, onSubmit } = this.props;
    const { data, tags, labels, ...config } = this.state;
    this.setState({
      loading: true
    });
    Meteor.call(
      "people.import",
      {
        campaignId,
        config,
        filename,
        data,
        defaultValues: {
          tags,
          labels
        }
      },
      (err, res) => {
        this.setState({
          loading: false
        });
        if (onSubmit) {
          onSubmit(err, res);
        }
      }
    );
  }
  render() {
    const { data, tags, labels, loading } = this.state;
    const headers = this._getHeaders();
    return (
      <Container>
        <Form onSubmit={this._handleSubmit}>
          <p>Associe as colunas da sua planilha aos dados da base.</p>
          <ItemConfigContainer className="header">
            <div>
              <h4>Cabeçalho da planilha</h4>
            </div>
            <span className="arrow">
              <FontAwesomeIcon icon="arrow-right" />
            </span>
            <div>
              <h4>Campo</h4>
            </div>
          </ItemConfigContainer>
          {headers.map((header, i) => (
            <ItemConfig key={i} header={header} onChange={this._handleChange} />
          ))}
          <Form.Field label="Selecione tags padrão para todas as entradas da importação">
            <TagSelect
              onChange={this._handleTagChange}
              value={tags}
              label="Default tags for this import"
            />
          </Form.Field>
          <Form.Field label="Selecione categorias padrão para todas as entradas da importação">
            <PersonMetaButtons
              size="big"
              onChange={this._handleMetaButtons}
              active={labels}
            />
          </Form.Field>
          {/* <Form.Field
          control={PeopleMetaButtons}
          size="big"
          onChange={this._handleMetaButtons}
          active={labels}
          label="Default labels for this import"
        /> */}
          <input type="submit" value="Iniciar importação" />
          {/* <Button primary fluid disabled={loading} icon>
          <Icon name={loading ? "spinner" : "download"} loading={loading} />{" "}
          Start import
        </Button> */}
        </Form>
      </Container>
    );
  }
}
