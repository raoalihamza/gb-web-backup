import React, { useState, useRef, useEffect } from 'react';
import { Col, Row } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Iframe from 'react-iframe'
import Layout from '../Layout';
import { makeStyles } from '@material-ui/core/styles';
import TawkMessengerReact from '@tawk.to/tawk-messenger-react';

function getWindowDimensions() {
	const { innerWidth: width, innerHeight: height } = window;
	return {
	  width,
	  height
	};
  }

const useStyles = makeStyles({
	iframe: {
	  border:0
	},
	
  });

const KBS = ({ t }) => {
	const isCollapsed = useSelector((state) => state.sidebar.collapse);

	const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

	useEffect(() => {
		function handleResize() {
		setWindowDimensions(getWindowDimensions());
		}

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const styles = useStyles();
	const width = windowDimensions.width - 240;

	return(
		<Layout>
			<div className={classnames(
				'faq',
				!isCollapsed ? 'sidebar-visible' : null,
			)}>
				<Row>
					<Col md={12}>
						<h3 className="page-title">{t('default_pages.kbs.title')}</h3>
						<h3 className="page-subhead subhead">
							{t('default_pages.kbs.subhead')}
						</h3>
					</Col>
				</Row>
				<Row>
				<div style={{overflow: "hidden"}}>
					<Iframe 
					id='kbs'
					src="https://greenplay.tawk.help/" 
					height={windowDimensions.height - 50} 
					width={width}
					position='relative'
					className={styles.iframe}
					overflow='hidden'
					/>
					</div>
				</Row>
			</div>
			<TawkMessengerReact
                propertyId="6464f134ad80445890ed80d9"
                widgetId="1h0l4sdos"/>
		</Layout>
	);
};
KBS.propTypes = {
	t: PropTypes.func.isRequired,
};

export default withTranslation('common')(KBS);
