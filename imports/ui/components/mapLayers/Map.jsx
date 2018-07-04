import React from "react";
import styled from "styled-components";
import L from "leaflet";
import { Table } from "semantic-ui-react";
import "Leaflet.utfgrid";
import {
  Map,
  Marker,
  Popup,
  TileLayer,
  LayerGroup,
  GeoJSON
} from "react-leaflet";

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  .grid-data {
    position: absolute;
    top: 0;
    right: 0;
    width: 250px;
    z-index: 9999;
    margin: 10px;
    .grid-item {
      background: #fff;
      margin: 0 0 0.5rem;
    }
  }
`;

class GridItem extends React.Component {
  render() {
    const { data } = this.props;
    const keys = Object.keys(data);
    return (
      <Table definition compact="very">
        {keys.map(key => (
          <Table.Row key={key}>
            <Table.Cell collapsing>{key}</Table.Cell>
            <Table.Cell>{data[key]}</Table.Cell>
          </Table.Row>
        ))}
      </Table>
    );
  }
}

export default class LayersMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      grid: []
    };
    this.grids = [];
  }
  componentDidMount() {
    const map = this.refs.map.leafletElement;
    const { layers } = this.props;
    this._updateGrids(layers);
  }
  componentWillReceivesProps(nextProps) {
    this._updateGrids(nextProps.layers);
  }
  _updateGrids(layers) {
    const map = this.refs.map.leafletElement;
    for (const grid of this.grids) {
      map.removeLayer(grid);
    }
    this.grids = [];
    for (const layer of layers) {
      if (layer.tilejson) {
        const utfgrid = new L.UtfGrid(layer.tilejson, {
          useJsonP: false
        });
        this.grids.push(utfgrid);
        utfgrid.addTo(map);
        utfgrid.on("mouseover", e => {
          this._addGridItem(e.data);
        });
        utfgrid.on("mouseout", e => {
          this._removeGridItem(e.data);
        });
      }
    }
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
  _bounds() {
    const { layers } = this.props;
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
    return bounds;
  }
  render() {
    const { layers, ...props } = this.props;
    const { grid } = this.state;
    return (
      <Wrapper>
        <div className="grid-data">
          {grid.map((item, i) => (
            <div key={i} className="grid-item">
              <GridItem data={item} />
            </div>
          ))}
        </div>
        <Map
          ref="map"
          center={[0, 0]}
          zoom={2}
          scrollWheelZoom={false}
          bounds={this._bounds()}
          style={{
            width: "100%",
            height: "400px"
          }}
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
        </Map>
      </Wrapper>
    );
  }
}
