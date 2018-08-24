import React from "react";
import PropTypes from "prop-types";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import {
  Form,
  Input,
  TextArea,
  Grid,
  Button,
  Icon,
  Divider
} from "semantic-ui-react";
import LayerCategoryField from "/imports/ui/components/mapLayers/LayerCategoryField.jsx";
import LayerTagsField from "/imports/ui/components/mapLayers/LayerTagsField.jsx";
import Map from "/imports/ui/components/mapLayers/Map.jsx";
import { Alerts } from "/imports/ui/utils/Alerts.js";

const initialFields = {
  title: ""
};

export default class EditMapLayersPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: Object.assign({}, initialFields),
      isLoading: false
    };
    this._handleSubmit = this._handleSubmit.bind(this);
    this._handleChange = this._handleChange.bind(this);
    this._handleRemove = this._handleRemove.bind(this);
  }
  componentDidMount() {
    const { mapLayer } = this.props;
    if (mapLayer && mapLayer._id) {
      const { fields } = this.state;
      const {
        _id,
        title,
        description,
        category,
        tags,
        tilelayer,
        tilejson,
        domegisUrl,
        domegisId,
        bbox
      } = mapLayer;
      this.setState({
        fields: {
          ...fields,
          _id,
          title,
          description,
          category,
          tags,
          tilelayer,
          tilejson,
          domegisUrl,
          domegisId,
          bbox
        }
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.mapLayer) {
      if (nextProps.mapLayer._id) {
        const { fields } = this.state;
        const {
          _id,
          title,
          description,
          category,
          tags,
          tilelayer,
          tilejson,
          domegisUrl,
          domegisId,
          bbox
        } = nextProps.mapLayer;
        this.setState({
          fields: {
            ...fields,
            _id,
            title,
            description,
            category,
            tags,
            tilelayer,
            tilejson,
            domegisUrl,
            domegisId,
            bbox
          }
        });
      } else {
        this.setState({
          fields: Object.assign({}, initialFields)
        });
      }
    }
  }
  _handleChange = (e, { name, value }) =>
    this.setState({
      fields: Object.assign({}, this.state.fields, { [name]: value })
    });
  _handleSubmit(e) {
    const { mapLayerId } = this.props;
    const { fields } = this.state;
    this.setState({ isLoading: true });
    if (mapLayerId) {
      Meteor.call("mapLayers.update", fields, err => {
        this.setState({ isLoading: false });
        if (err) {
          Alerts.error(err);
        } else {
          Alerts.success("Layer updated successfully");
        }
      });
    } else {
      Meteor.call("mapLayers.create", fields, (err, res) => {
        this.setState({ isLoading: false });
        if (err) {
          Alerts.error(err);
        } else {
          Alerts.success("Layer created successfully");
          FlowRouter.withReplaceState(function() {
            FlowRouter.setParams({ mapLayerId: res });
          });
        }
      });
    }
  }
  _handleRemove(e) {
    e.preventDefault();
    this.context.confirmStore.show({
      callback: () => {
        const { mapLayerId } = this.props;
        this.setState({ isLoading: true });
        if (mapLayerId) {
          Meteor.call("mapLayers.remove", { mapLayerId }, error => {
            this.setState({ isLoading: false });
            if (error) {
              Alerts.error(error);
            } else {
              Alerts.success("Layer was removed successfully");
              this.context.confirmStore.hide();
              FlowRouter.go("App.admin.mapLayers");
            }
          });
        }
      }
    });
  }
  _handleBboxClick = ev => {
    ev.preventDefault();
    const map = this.mapRef.refs.map.leafletElement;
    const bounds = map.getBounds();
    this.setState({
      fields: {
        ...this.state.fields,
        bbox: [
          [bounds.getSouth(), bounds.getWest()],
          [bounds.getNorth(), bounds.getEast()]
        ]
      }
    });
    Alerts.warning("Bounding box updated, save to store these changes.");
  };
  render() {
    const { mapLayerId, mapLayer, loading, available } = this.props;
    const { fields, isLoading } = this.state;
    return (
      <div>
        <PageHeader
          title="Map Layers"
          titleTo={FlowRouter.path("App.admin.mapLayers")}
          subTitle={
            mapLayerId
              ? `Editing ${mapLayer ? mapLayer.title : ""}`
              : "New Map Layer"
          }
        />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <Grid>
              <Grid.Row>
                <Grid.Column>
                  {mapLayer && mapLayer.tilelayer ? (
                    <>
                      <Map layers={[mapLayer]} ref={el => (this.mapRef = el)} />
                      <Divider />
                      {!mapLayer.domegisUrl ? (
                        <div>
                          <Button fluid onClick={this._handleBboxClick}>
                            Set current view as bounding box
                          </Button>
                          <Divider />
                        </div>
                      ) : null}
                    </>
                  ) : null}
                  <Form onSubmit={this._handleSubmit} loading={isLoading}>
                    <Form.Field
                      control={Input}
                      label="Title"
                      placeholder="Title"
                      name="title"
                      onChange={this._handleChange}
                      value={fields.title}
                    />
                    <Form.Field
                      control={TextArea}
                      label="Description"
                      placeholder="Write a description for this layer"
                      name="description"
                      onChange={this._handleChange}
                      value={fields.description}
                    />
                    <Form.Field
                      control={LayerCategoryField}
                      label="Category"
                      placeholder="Select a category"
                      name="category"
                      onChange={this._handleChange}
                      value={fields.category}
                    />
                    <Form.Field
                      control={LayerTagsField}
                      label="Tags"
                      placeholder="Select tags"
                      name="tags"
                      onChange={this._handleChange}
                      value={fields.tags || []}
                    />
                    <Form.Field
                      control={Input}
                      label="DomeGIS URL"
                      placeholder="https://domegis.example.com"
                      name="domegisUrl"
                      onChange={this._handleChange}
                      value={fields.domegisUrl}
                    />
                    <Form.Field
                      control={Input}
                      label="DomeGIS ID"
                      placeholder="a12345b1-1a2b-12a3-1abc-123a567cd8e"
                      name="domegisId"
                      onChange={this._handleChange}
                      value={fields.domegisId}
                    />
                    {!fields.domegisUrl ? (
                      <>
                        <Form.Field
                          control={Input}
                          label="TileLayer URL"
                          placeholder="https://{s}.example.com/{x}/{y}/{z}.png"
                          name="tilelayer"
                          onChange={this._handleChange}
                          value={fields.tilelayer}
                        />
                        <Form.Field
                          control={Input}
                          label="TileJSON URL"
                          placeholder="https://{s}.example.com/{x}/{y}/{z}.json"
                          name="tilejson"
                          onChange={this._handleChange}
                          value={fields.tilejson}
                        />
                      </>
                    ) : null}
                    {mapLayerId ? (
                      <Button onClick={this._handleRemove} negative>
                        <Icon name="trash" />
                        Remove layer
                      </Button>
                    ) : (
                      ""
                    )}
                    <Button primary>
                      <Icon name="save" />
                      Save
                    </Button>
                  </Form>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          )}
        </section>
      </div>
    );
  }
}

EditMapLayersPage.contextTypes = {
  confirmStore: PropTypes.object
};
