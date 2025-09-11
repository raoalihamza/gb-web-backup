/* eslint-disable react/no-unused-state,react/no-unescaped-entities */
import React from 'react';
import { useTable, useSortBy, usePagination } from 'react-table';
import { Card, CardBody, Col, Button } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { routes } from '../../App/Router';
import CategoryViewModel from './CategoryViewModel.js';
import DataTablePagination from '../../../shared/components/dataTable/DataTablePagination';
import DataTableHeader from '../../../shared/components/dataTable/DataTableHeader';
import DataTableBody from '../../../shared/components/dataTable/DataTableBody';
import { ListSkeleton } from './Skeletons';

function DataTable({
	userId,
	update,
	t,
}) {
	const categoryViewModel = React.useMemo(() => new CategoryViewModel(), []);

	const [categories, setCategories] = React.useState([]);
	const [loading, setLoading] = React.useState(false);

	React.useEffect(() => {
		setLoading(true);
		categoryViewModel
			.getCategories(userId)
			.then((orgCategories) => {
				setCategories(orgCategories);
			})
			.catch((error) => {
				console.log('Error getting categories', error);
			})
			.finally(() => setLoading(false));
		return () => {};
	}, [categoryViewModel, update]);

	function deleteCategory(categoryId) {
		setLoading(true);
		categoryViewModel.deleteCategory(userId, categoryId)
			.then(() => {
				const updatedCategories = Array.isArray(categories)
					? categories?.filter((item) => {
						return categoryId != item.categoryId
					}): [];
				setCategories(updatedCategories)

			})
			.catch((error) => {
				console.log('Exact error log:', error);
			
			})
			.finally(() => setLoading(false));
	}

	const data = React.useMemo(
		() => Array.isArray(categories)
			? categories?.map((item, index) => {
				return {
					key: index + 1,
					categoryName: item.categoryName,
					description: item.description,
					logoUrl: item.logoUrl,
					categoryId: item.categoryId,
				};
			}): [],
		[categories],
	);

	const columns = React.useMemo(
		() => categoryViewModel.tableColumnData(t), 
		[ categoryViewModel, t ]
	);

	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		page,
		canPreviousPage,
		canNextPage,
		pageOptions,
		pageCount,
		gotoPage,
		nextPage,
		previousPage,
		prepareRow,
		data: _data,
		state: { pageIndex },
	} = useTable({ columns, data, initialState: { pageSize: 10 } }, useSortBy, usePagination);

	return (
		<Col className="card">
			<Card>
				<CardBody>
					<div className="card__title d-flex align-items-center justify-content-between">
						<h5 className="bold-text">{t('category.list_title')}</h5>
					
					</div>
					{!loading ? (
						<div className="users-table-card-body">
							{page.length > 0 ? (<>
								<table {...getTableProps()} className="data-table">
									<DataTableHeader headerGroups={headerGroups} sortable />
									<DataTableBody
										getTableBodyProps={getTableBodyProps}
										prepareRow={prepareRow}
										page={page}
									/>
								</table>
								<DataTablePagination
									gotoPage={gotoPage}
									nextPage={nextPage}
									previousPage={previousPage}
									pageIndex={pageIndex}
									pageOptions={pageOptions}
									pageCount={pageCount}
									canNextPage={canNextPage}
									canPreviousPage={canPreviousPage}
								/>
							</>) : (
								<span>{t('category.no_category')}</span>
							)}
						</div>
					) : (
						<ListSkeleton />
					)}
				</CardBody>
			</Card>
		</Col>
	);
}
DataTable.propTypes = {
	t: PropTypes.func.isRequired,
};

export default withTranslation('common')(DataTable);
