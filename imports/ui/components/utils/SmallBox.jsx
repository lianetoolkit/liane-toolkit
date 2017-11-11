import React from "react";
import PropTypes from "prop-types";

export default class SmallBox extends React.Component {
  constructor(props) {
    super(props);
  }
  pathFor(pathName) {
    return FlowRouter.path(pathName);
  }
  render() {
    const { color, pathName, data, title, icon } = this.props;
    return (
      <div className={`small-box bg-${color ? color : "aqua"}`}>
        <div className="inner">
          <h3>{data}</h3>
          <p>{title}</p>
        </div>
        <div className="icon">
          <i className={`fa fa-${icon}`} />
        </div>
        <a href={this.pathFor(pathName)} className="small-box-footer">
          More info <i className="fa fa-arrow-circle-right" />
        </a>
      </div>
    );
  }
}

SmallBox.propTypes = {
  color: PropTypes.string,
  pathName: PropTypes.string,
  data: PropTypes.number,
  title: PropTypes.string,
  icon: PropTypes.string
};
