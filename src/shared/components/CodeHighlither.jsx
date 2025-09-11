import React, { PureComponent } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter/prism';
import { darcula } from 'react-syntax-highlighter/styles/prism';
import PropTypes from 'prop-types';

export default class CodeHighlither extends PureComponent {
	render() {
		const { scss, children } = this.props;

		return (
			<SyntaxHighlighter
				showLineNumbers
				language={scss ? 'scss' : 'jsx'}
				style={darcula}
			>
				{children}
			</SyntaxHighlighter>
		);
	}
}

CodeHighlither.propTypes = {
	scss: PropTypes.bool,
	children: PropTypes.string.isRequired,
};

CodeHighlither.defaultProps = {
	scss: false,
};
