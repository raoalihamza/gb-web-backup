import React from "react";
import PropTypes from "prop-types";

class ExcelColumn extends React.Component {
    render() {
        return null;
    }
}

ExcelColumn.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.bool,
        PropTypes.string,
        PropTypes.func
    ]).isRequired
};

export default ExcelColumn;