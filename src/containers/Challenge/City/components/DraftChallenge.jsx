import React from 'react';
import { useTable, usePagination } from 'react-table';
import { Card, CardBody, Col } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { routes } from '../../../App/Router';
import ChallengeViewModel from './../../ChallengeViewModel';
import DataTablePagination from '../../../../shared/components/dataTable/DataTablePagination';
import DataTableHeader from '../../../../shared/components/dataTable/DataTableHeader';
import DataTableBody from '../../../../shared/components/dataTable/DataTableBody';
import { PreviewsSkeleton } from "../../Organisation/components/Skeletons";
import { formatDateTranslated } from 'utils';

export default function DraftChallenges({ userID, branch }) {
	const [t] = useTranslation('common');

	const [challenges, setChallenges] = React.useState([]);
	const [loading, setLoading] = React.useState(false);

	const challengeViewModel = React.useMemo(
		() => new ChallengeViewModel(userID, t, false),
		[userID, t, false],
	);

	React.useEffect(() => {
		let isUnmounted = false;

		setLoading(true);
		challengeViewModel
			.getDraftChallenges()
			.then((response) => {
				if (!isUnmounted) {
					setChallenges(response.docs.map((challenge) => ({ ...challenge.data(), id: challenge.id })));
				}
			})
			.catch((error) => {
				if (!isUnmounted) {
					console.log('Fetch error', error);
				}
			})
			.finally(() => setLoading(false));
		return () => {
			isUnmounted = true;
		};
	}, [challengeViewModel]);

	const columns = React.useMemo(() => challengeViewModel.tableColumnDataDraft(), [
		challengeViewModel,
		t,
	]);

	const data = React.useMemo(
		() => Array.isArray(challenges)
			? challenges.filter((value) =>
				!value?.branchId || !branch || value?.branchId === branch
			).map((rowData) => {

				return {
					name: rowData?.nameFrench || "",
					startDate: formatDateTranslated(rowData?.startAt?.toDate(), t) || '',
					endDate: formatDateTranslated(rowData?.endAt?.toDate(), t) || '',
					reward: rowData?.rewardGreenPoints || 0,
					challengeId: rowData?.id,
				};
			}) : [],
		[challenges, branch],
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
	} = useTable({ columns, data, initialState: { pageSize: 5 } }, usePagination);

	return (
		<Col>
			<Card>
				<CardBody>
					<div className="card__title d-flex align-items-center justify-content-between mb-0">
						<h5 className="bold-text text-left challenge-title">
							{t('challenge.draft_challenges')}
						</h5>
					</div>
					{!loading ? (
						<div className="text-center">
							{page.length > 0 ? (<>
								<table {...getTableProps()} className="data-table">
									<DataTableHeader headerGroups={headerGroups} />
									<DataTableBody
										getTableBodyProps={getTableBodyProps}
										prepareRow={prepareRow}
										page={page}
										additionalColumns={(row) =>
										(<td className="data-table-data">
											<NavLink
												to={routes.city.challengeEdit.replace(':id', row.original.challengeId)}
												className="challenge-link mr-1"
											>
												{t('global.edit')}
											</NavLink>
											<NavLink
												to={routes.city.challengeInfo.replace(':id', row.original.challengeId)}
												className="challenge-link ml-1"
											>
												{t('global.info')}
											</NavLink>
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
								<span>{t('challenge.no_draft')}</span>
							)}
						</div>
					) : (
						<PreviewsSkeleton />
					)}
				</CardBody>
			</Card>
		</Col>
	);
}