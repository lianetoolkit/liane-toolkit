import React from "react";
import styled from "styled-components";
import L from "leaflet";
import { Header, Table } from "semantic-ui-react";
import "leaflet.utfgrid";
import {
  Map,
  Marker,
  Popup,
  TileLayer,
  LayerGroup,
  GeoJSON
} from "react-leaflet";

const imagePath = "/";
L.Icon.Default.imagePath = imagePath;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "images/map/marker-icon-2x.png",
  iconUrl: "images/map/marker-icon.png",
  shadowUrl: "images/map/marker-shadow.png"
});

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: ${props => props.height || "400px"};
  .leaflet-container {
    width: 100%;
    height: 100%;
  }
  .grid-data {
    position: absolute;
    top: 0;
    right: 0;
    width: 250px;
    z-index: 9999;
    margin: 0 10px;
    .grid-item {
      background: #fff;
      margin: 0 0 0.5rem;
      h3,
      h4 {
        font-weight: 600;
        padding: 1rem 0 0 0;
        margin: 1rem 0.5rem;
        line-height: 1;
      }
      h3 {
        font-size: 1.2em;
      }
      h4 {
        font-size: 1em;
      }
      .ui.table {
        color: #444;
      }
      .ui.definition.table tr td:first-child:not(.ignored),
      .ui.definition.table tr td.definition {
        color: #777;
      }
      .grid-list-item {
        font-size: 0.9em;
        h3,
        h4 {
          padding: 0;
          margin: 1rem 0.5rem;
        }
      }
    }
  }
`;

class GridItem extends React.Component {
  _value(val) {
    if (typeof val == "string" || !isNaN(val)) {
      return val;
    } else if (Array.isArray(val)) {
      return val.join(", ");
    } else {
      return "";
    }
  }
  _table(obj) {
    const { name, ...data } = obj;
    const keys = Object.keys(data);
    return (
      <div>
        {name ? <Header as="h4">{name}</Header> : null}
        <Table definition compact="very">
          <Table.Body>
            {keys.map(key => (
              <Table.Row key={key}>
                <Table.Cell collapsing>{key}</Table.Cell>
                <Table.Cell>{this._value(data[key])}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    );
  }
  render() {
    const { grid } = this.props;
    if (grid.type == "table") {
      return (
        <div className="grid-table">
          {grid.name ? <Header as="h3">{grid.name}</Header> : null}
          {this._table(grid.data)}
        </div>
      );
    } else if (grid.type == "list") {
      return (
        <div className="grid-list">
          {grid.name ? <Header as="h3">{grid.name}</Header> : null}
          {grid.data.map((item, i) => (
            <div className="grid-list-item" key={i}>
              {this._table(item)}
            </div>
          ))}
        </div>
      );
    }
  }
}

export default class LayersMap extends React.Component {
  static defaultProps = {
    layers: []
  };
  constructor(props) {
    super(props);
    this.state = {
      grid: []
    };
    this.grids = [];
  }
  componentDidMount() {
    const map = this.refs.map.leafletElement;
    const { layers, defaultBounds } = this.props;
    this._updateGrids(layers);
    if (defaultBounds) {
      this._bounds();
    }
  }
  componentWillReceiveProps(nextProps) {
    const { layers, defaultBounds } = this.props;
    if (JSON.stringify(layers) !== JSON.stringify(nextProps.layers)) {
      this._updateGrids(nextProps.layers);
    }
    if (
      JSON.stringify(defaultBounds) !== JSON.stringify(nextProps.defaultBounds)
    ) {
      this._bounds(nextProps.defaultBounds);
    }
  }
  _updateGrids(layers) {
    const map = this.refs.map.leafletElement;
    for (const grid of this.grids) {
      map.removeLayer(grid);
    }
    this.grids = [];
    this.setState({ grid: [] });
    for (const layer of layers) {
      if (layer.tilejson) {
        const utfgrid = new L.UtfGrid(layer.tilejson, {
          useJsonP: false
        });
        this.grids.push(utfgrid);
        map.addLayer(utfgrid);
        utfgrid.on("mouseover", e => {
          this._addGridItem({
            type: "table",
            name: layer.title,
            data: e.data
          });
        });
        utfgrid.on("mouseout", e => {
          this._removeGridItem({
            type: "table",
            name: layer.title,
            data: e.data
          });
        });
      }
    }
    this._bounds();
  }
  _addGridItem = data => {
    const { grid } = this.state;
    if (!grid || !grid.length) {
      this.setState({
        grid: [data]
      });
    } else {
      const found = grid.find(
        item => JSON.stringify(item) == JSON.stringify(data)
      );
      if (!found) {
        this.setState({
          grid: [...grid, data]
        });
      }
    }
  };
  _removeGridItem = data => {
    const { grid } = this.state;
    if (grid && grid.length) {
      let newGrid = [...grid];
      newGrid = newGrid.filter(
        item => JSON.stringify(item) != JSON.stringify(data)
      );
      this.setState({
        grid: newGrid
      });
    }
  };
  _bounds(defaultBounds) {
    const { layers } = this.props;
    defaultBounds = defaultBounds || this.props.defaultBounds;
    let latlngs = [];
    let bounds;
    for (const layer of layers) {
      if (layer.bbox && layer.bbox.length) {
        if (bounds) {
          bounds.extend(L.latLngBounds(layer.bbox[0], layer.bbox[1]));
        } else {
          bounds = L.latLngBounds(layer.bbox[0], layer.bbox[1]);
        }
      }
    }
    if (defaultBounds) {
      for (const bound of defaultBounds) {
        if (bounds) {
          bounds.extend(bound);
        } else {
          bounds = bound;
        }
      }
    }
    this.setState({ bounds });
    if (bounds) {
      const map = this.refs.map.leafletElement;
      if (map) {
        map.fitBounds(bounds);
      }
    }
  }
  render() {
    const { layers, children, height, defaultGrid, ...props } = this.props;
    const { grid } = this.state;
    return (
      <Wrapper height={height}>
        <div className="grid-data">
          {defaultGrid && defaultGrid.length ? (
            <>
              {defaultGrid.map((item, i) => (
                <div key={i} className="grid-item">
                  <GridItem grid={item} />
                </div>
              ))}
            </>
          ) : null}
          {grid.map((item, i) => (
            <div key={i} className="grid-item">
              <GridItem grid={item} />
            </div>
          ))}
        </div>
        <Map
          ref="map"
          center={[0, 0]}
          zoom={2}
          scrollWheelZoom={false}
          {...props}
        >
          <TileLayer
            opacity={0.5}
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          />
          {layers.map(layer => (
            <TileLayer key={layer._id} url={layer.tilelayer} />
          ))}
          {children}
        </Map>
      </Wrapper>
    );
  }
}
