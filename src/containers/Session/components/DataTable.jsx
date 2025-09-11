/* eslint-disable react/no-unused-state,react/no-unescaped-entities */
import React, { PureComponent } from 'react';
import { Card, CardBody, Col } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
// import { CSVLink } from 'react-csv';

// import DataPaginationTable from '../../../shared/components/table/DataPaginationTable';
import Pagination from '../../../shared/components/pagination/Pagination';
import Config from '../../config';
import firebase from '../../firebase';
import SessionExcel from './SessionExcel';

class DataTable extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			rows: [],
			rowsToShow: [],
			excelsession: [],
			pageOfItems: 1,
			itemsToShow: 1,
		};

		// const initialPageNumber = 1;
		// const initialRowsCount = 10;

		// const minRows = 20;
		// const maxRows = 41;
		// const rowsCount = Math.random() * (maxRows - minRows);
		// const originalRows = this.createRows(rowsCount);
		// const currentPageRows = this.filterRows(originalRows, initialPageNumber, initialRowsCount);
	}

	componentDidMount() {
		this.getData();
	}

	// eslint-disable-next-line react/no-deprecated
	componentWillReceiveProps() {
		this.getData();
	}

	onChangePage(pageOfItems) {
		const { rows, itemsToShow } = this.state;
		if (pageOfItems) {
			const rowsToShow = this.filterRows(rows, pageOfItems, itemsToShow);
			this.setState({ rowsToShow, pageOfItems });
		}
	}

	onSorting(sortColumn, sortDirection) {
		const comparer = (a, b) => {
			if (sortDirection === 'ASC') {
				return a[sortColumn] > b[sortColumn] ? 1 : -1;
			}
			return a[sortColumn] < b[sortColumn] ? 1 : -1;
		};
		const { rows, pageOfItems, itemsToShow } = this.state;
		if (sortDirection !== 'NONE') {
			let sortRows = [...rows].sort(comparer);
			sortRows = this.filterRows(sortRows, pageOfItems, itemsToShow);
			this.setState({ rowsToShow: sortRows });
			return sortRows;
		}
		const sortRows = this.filterRows(rows, pageOfItems, itemsToShow);
		this.setState({ rowsToShow: sortRows });
		return sortRows;
	}

	getData() {
		const initialPageNumber = 1;
		const initialRowsCount = 5;
		const bearer = 'Bearer ';
		const AuthStr = bearer + localStorage.getItem('loggedin_token');
		const sessionurl = 'api/user/get/sessions/';
		const id = localStorage.getItem('loggedin_id');

		firebase
			.database()
			// eslint-disable-next-line prefer-template
			.ref('user_sessions/' + id)
			.on('value', (snap) => {

			});
	}

	getRandomDate(start, end) {
		return new Date(
			start.getTime() + Math.random() * (end.getTime() - start.getTime()),
		).toLocaleDateString();
	}

	formatDate(date) {
		const space = '';
		const space1 = ' ';
		const zero = '0';
		const d = new Date(date);
		let month = space + (d.getMonth() + 1);
		let day = space + d.getDate();
		const year = d.getFullYear();
		let hours = space + d.getHours();
		let minutes = space + d.getMinutes();
		let seconds = space + d.getSeconds();
		if (month.length < 2) month = zero + month;
		if (day.length < 2) day = zero + day;
		if (hours.length < 2) hours = zero + hours;
		if (minutes.length < 2) minutes = zero + minutes;
		if (seconds.length < 2) seconds = zero + seconds;

		const date1 = [year, month, day].join('-');
		const time = [hours, minutes, seconds].join(':');
		const datetime = date1 + space1 + time;
		return datetime;
	}

	createRows(numberOfRows, data) {
		const rows = [];
		for (let i = 0; i < numberOfRows; i += 1) {
			const editurl = '/user/session/update/';
			const newediturl = editurl + data[i].SessionNo;
			const { t } = this.props;
			rows.push({
				SessionId: i + 1,
				movementDateTime: this.formatDate(data[i].movementDateTime),
				TransportMode: data[i].Activity_Name,
				distance: data[i].sustainableDistance,
				CreatedOn: this.formatDate(data[i].createdate),
				Action: (
					<div>
						<NavLink color="primary" to={newediturl}>
							{t('session.edit')}
						</NavLink>{' '}
						/
						<NavLink
							color="primary"
							to="#"
							onClick={() => this.delete(data[i].SessionNo)}
						>
							{t('session.delete')}
						</NavLink>
					</div>
				),
			});
		}
		return rows;
	}

	filterRows(originalRows, pageNumber, rowsOnPage) {
		const rowsFrom = rowsOnPage * (pageNumber - 1);
		const rowsTo = rowsFrom + rowsOnPage;
		return originalRows.slice(rowsFrom, rowsTo);
	}

	delete(id) {
		const deleteurl = 'api/user/sessions/delete/';
		const bearer = 'Bearer ';
		const AuthStr = bearer + localStorage.getItem('loggedin_token');
		axios
			.get(Config.API_URL + deleteurl + id, {
				headers: { Authorization: AuthStr },
			})
			.then((response) => {
				if (response.data.code === 200) {
					this.getData();

				}
			});
	}

	render() {
		const { t } = this.props;
		const {
			rows,
			itemsToShow,
			pageOfItems,
			rowsToShow,
			excelsession,
		} = this.state;
		return (
			<Col md={12} lg={12}>
				<Card>
					<CardBody>
						<div className="card__title">
							<h5 className="bold-text">{t('session.list_title')}</h5>
							<SessionExcel data={excelsession} />
						</div>
						{/* <DataPaginationTable
							heads={[
								{
									key: 'SessionId',
									name: '#',
									width: 80,
								},
								{
									key: 'movementDateTime',
									name: t('session.date_time'),
									sortable: true,
								},
								{
									key: 'TransportMode',
									name: t('session.transport_mode'),
									sortable: true,
								},
								{
									key: 'distance',
									name: t('session.distance'),
									sortable: true,
								},
								{
									key: 'CreatedOn',
									name: t('session.created_on'),
									sortable: true,
								},
								{
									key: 'Action',
									name: t('session.action'),
									sortable: false,
								},
							]}
							rows={rowsToShow}
							onSorting={this.onSorting}
						/> */}
						<Pagination
							itemsCount={rows.length}
							itemsToShow={itemsToShow}
							pageOfItems={pageOfItems}
							onChangePage={this.onChangePage}
						/>
					</CardBody>
				</Card>
			</Col>
		);
	}
}

DataTable.propTypes = {
	t: PropTypes.func.isRequired,
};

export default withTranslation('common')(DataTable);
