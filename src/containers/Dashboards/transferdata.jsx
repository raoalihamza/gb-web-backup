import React, { PureComponent } from 'react';
import { Card, CardBody, Col } from 'reactstrap';
import axios from 'axios';
import Config from '../config';

class TransferData extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			message: '',
			response1: '',
			response2: '',
			response3: '',
		};
	}

	componentDidMount() {
		// const token = localStorage.getItem('loggedin_token');
		// console.log('token');
		const id = localStorage.getItem('loggedin_id');
		const datatransfer = 'api/datainsert/user/';
		const bearer = 'Bearer ';
		const AuthStr = bearer + localStorage.getItem('loggedin_token');
		axios
			.get(Config.API_URL + datatransfer + id, {
				headers: { Authorization: AuthStr },
			})
			.then((response) => {
		
				this.setState({ message: response.data.message });
				this.setState({ response1: response.data.data1.affectedRows });
				this.setState({ response2: response.data.data2.affectedRows });
				this.setState({ response3: response.data.data3.affectedRows });
			});
	}

	render() {
		const { message, response1, response2, response3 } = this.state;
		return (
			<Col md={12} lg={12} xl={12}>
				<Card>
					<CardBody className="profile__card">
						<div className="profile__information">
							<div className="card__title">
								<h5 className="bold-text">{message}</h5>
								<h5>
									{' '}
									First query response :{' '}
									<span className="bold-text"> {response1}</span> row affected
								</h5>
								<h5>
									{' '}
									Second query response :{' '}
									<span className="bold-text"> {response2}</span> row affected
								</h5>
								<h5>
									{' '}
									Third query response :{' '}
									<span className="bold-text"> {response3}</span> row affected
								</h5>
							</div>
						</div>
					</CardBody>
				</Card>
			</Col>
		);
	}
}

export default TransferData;
