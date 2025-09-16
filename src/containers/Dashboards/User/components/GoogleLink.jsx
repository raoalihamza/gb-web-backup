/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ButtonToolbar, Modal } from 'reactstrap';
import classNames from 'classnames';
import axios from 'axios';
import { withTranslation } from 'react-i18next';
import Config from '../../../config';

const GOOGLE_AUTHENTICATION_URL =
	import.meta.env.VITE_GOOGLE_AUTHENTICATION_URL;
const GOOGLE_AUTHENTICATION_URL_CODE =
	import.meta.env.VITE_GOOGLE_AUTHENTICATION_URL_CODE;

function getGoogleAuthenticationUrlWithAccountNumber(accountNo) {
	return `${GOOGLE_AUTHENTICATION_URL}accountNo=${accountNo}&code=${GOOGLE_AUTHENTICATION_URL_CODE}`;
}

class ModalComponent extends PureComponent {
	constructor() {
		super();
		this.state = {
			modal: true,
			datacollection: '',
		};

		this.toggle = this.toggle.bind(this);
	}

	componentDidMount() {
		const reseturl = 'api/user/';
		const id = localStorage.getItem('loggedin_id');
		const bearer = 'Bearer ';
		const AuthStr = bearer + localStorage.getItem('loggedin_token');
		// axios.get(Config.API_URL + reseturl + id, { headers: { Authorization: AuthStr } })
		//   .then((response) => {
		//     if (response.data.code === 200) {
		//       this.setState({ datacollection: response.data.data[0].dataCollectionMethod });
		//     }
		//   });
	}

	toggle() {
		this.setState((prevState) => ({ modal: !prevState.modal }));
	}

	render() {
		const { color, title, t, colored, header, dataCollectionType } = this.props;
		const { modal, datacollection } = this.state;
		const accountNo = localStorage.getItem('loggedin_id');
		const app = `${process.env.PUBLIC_URL}/img/Download_on_the_App_Store_Badge_FR_RGB_wht_100217.svg`;
		const aicon = `${process.env.PUBLIC_URL}/img/google-fit-maxw-824.jpg`;
		let Icon;
	
		switch (color) {
			case 'primary':
				Icon = <span className="lnr lnr-flag modal__title-icon" />;
				break;
			case 'success':
				Icon = <span className="lnr lnr-thumbs-up modal__title-icon" />;
				break;
			case 'warning':
				Icon = <span className="lnr lnr-pushpin modal__title-icon" />;
				break;
			case 'danger':
				Icon = <span className="lnr lnr-cross-circle modal__title-icon" />;
				break;
			default:
				break;
		}
		const modalClass = classNames({
			'modal-dialog--colored': colored,
			'modal-dialog--header': header,
		});
		return (
			<div>
				<Modal
					isOpen={modal}
					toggle={this.toggle}
					className={`modal-dialog--${color} ${modalClass}`}
				>
					<div className="modal__header">
						<button
							className="lnr lnr-cross modal__close-btn"
							type="button"
							onClick={this.toggle}
						/>
						{header ? '' : Icon}
						<h4 className="bold-text  modal__title">{title}</h4>
					</div>
					{dataCollectionType === 1 && (
						<span>
							<div className="modal__body">{t('cmn.i_msg')}</div>
							<ButtonToolbar className="modal__footer">
								<a
									target="_blank"
									rel="noopener noreferrer"
									href="https://apps.apple.com/app/id1474561891"
								>
									<img className="" src={app} alt="" />
								</a>
							</ButtonToolbar>
						</span>
					)}
					{dataCollectionType === 2 && (
						<span>
							<div className="modal__body">{t('cmn.msg')}</div>
							<a href="https://play.google.com/store/apps/details?id=com.google.android.apps.fitness">
								<img className="app-img" src={aicon} alt="" />
							</a>
							<div className="modal__body">{t('cmn.a_msg')}</div>
							<ButtonToolbar className="modal__footer">
								<a
									href={getGoogleAuthenticationUrlWithAccountNumber(accountNo)}
									className="sl-btn"
									id="google-connect"
								>
									<span>Connect with Google</span>
								</a>
							</ButtonToolbar>
						</span>
					)}
				</Modal>
			</div>
		);
	}
}
ModalComponent.propTypes = {
	t: PropTypes.func.isRequired,
	title: PropTypes.string,
	// message: PropTypes.string,
	color: PropTypes.string.isRequired,
	colored: PropTypes.bool,
	header: PropTypes.bool,
	dataCollectionType: PropTypes.number.isRequired,
};

ModalComponent.defaultProps = {
	title: '',
	// message: '',
	colored: false,
	header: false,
};

export default withTranslation('common')(ModalComponent);
