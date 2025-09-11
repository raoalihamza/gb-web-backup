/* eslint-disable react/no-unused-state,react/no-unescaped-entities */
import React from 'react';
import { useTable, useSortBy, usePagination } from 'react-table';
import { Card, CardBody, Col, Button } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { routes } from '../../App/Router';
import BranchExcel from './BranchExcel';
import BranchViewModel from './BranchViewModel.js';
import DataTablePagination from '../../../shared/components/dataTable/DataTablePagination';
import DataTableHeader from '../../../shared/components/dataTable/DataTableHeader';
import DataTableBody from '../../../shared/components/dataTable/DataTableBody';
import { ListSkeleton } from './Skeletons';

function DataTable({
	userId,
	update,
	t,
	disabled
}) {
	const branchViewModel = React.useMemo(() => new BranchViewModel(), []);

	const [branches, setBranches] = React.useState([]);
	const [loading, setLoading] = React.useState(false);

	React.useEffect(() => {
		setLoading(true);
		branchViewModel
			.getBranches(userId)
			.then((orgBranches) => {
				setBranches(orgBranches);
			})
			.catch((error) => {
				console.log('Error getting branches', error);
			})
			.finally(() => setLoading(false));
		return () => {};
	}, [branchViewModel, update]);

	function deleteBranch(branchId) {
		setLoading(true);
		branchViewModel.deleteBranch(userId, branchId)
			.then(() => {
				const updatedBranches = Array.isArray(branches)
					? branches?.filter((item) => {
						return branchId != item.branchId
					}): [];
				setBranches(updatedBranches)

			})
			.catch((error) => {
				console.log('Exact error log:', error);

			})
			.finally(() => setLoading(false));
	}

	const data = React.useMemo(
		() => Array.isArray(branches)
			? branches?.map((item, index) => {
				return {
					key: index + 1,
					name: item.branchName,
					region: item.regionName,
					createdOn: item.createdOn,
					updatedOn: item.updatedOn,
					branchId: item.branchId,
				};
			}): [],
		[branches],
	);

	const columns = React.useMemo(
		() => branchViewModel.tableColumnData(t), 
		[ branchViewModel, t ]
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
						<h5 className="bold-text">{t('branch.list_title')}</h5>
						<BranchExcel data={branches} />
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
										additionalColumns={(row) =>
											(<td className="data-table-data">
												<NavLink
													to={routes.organisation.branchDetails.replace(':id', row.original.branchId)}
													className="branches-link"
													style={{ pointerEvents: disabled ? 'none' : 'auto' }}>
													{t('global.edit')}
												</NavLink>
												<Button
													onClick={() => deleteBranch(row.original.branchId)}
													color="danger"
													size="sm"
													disabled={disabled}
													className="mb-0">
													{t('global.delete')}
												</Button>
											</td>)
										}
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
								<span>{t('branch.no_branch')}</span>
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
