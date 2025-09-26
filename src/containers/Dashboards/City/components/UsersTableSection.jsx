import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Link } from "react-router-dom";
import { Col, Row } from 'reactstrap';
import DataTableWithExportToCSV from 'shared/components/dataTable/DataTableWithExportToCSV';
import { fetchDashboardTotalUsers } from 'services/common';
import tableFunctions from "shared/other/tableFunctions";
import DashboardViewModel from "./DashboardViewModal";
import dateUtils from "utils/dateUtils";
import { DASHBOARD_AVAILABLE_FILTER_TYPES } from "atomicComponents/FilterDatePicker";
import { getEndDateForDashboard } from "containers/Dashboards/common";

/**
 * Simple Users Table Section - No lazy loading logic, just loads data on mount
 */
export default function UsersTableSection({
    ownerType = 'city',
    ownerId,
    startDate,
    endDate,
    challengeId,
    branchId,
    filterBy,
    t, onClickUserRow, routes,
    downloadUsersExcelButtonRef,
    onClickDownloadExcelUsers,
    serverSide = true,
    pageSize = 10
}) {
    const [data, setData] = useState({
        totalUsers: null,
        usersListRowsData: [],
        userDataForCsv: null
    });
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);
    const [currentSort, setCurrentSort] = useState({ column: '', direction: 'asc' });

    // Create required column and table configurations
    const dashboardViewModel = useMemo(() => new DashboardViewModel(), []);
    const usersListColumns = useMemo(() => dashboardViewModel.usersTableColumnData(t), [dashboardViewModel, t]);
    const usersListTableDescriptionDataForCSV = useMemo(() => tableFunctions.getUsersListTableDescriptionDataForCSV(t), [t]);
    const usersTableCustomColumns = useMemo(() => tableFunctions.getUsersTableCustomColumns(t), [t]);

    const loadData = useCallback(async () => {
        setLoading(true);

        try {
            // Get the challenge object if challengeId is provided
            const challenge = challengeId ? { id: challengeId } : null;

            // Format dates properly using the same logic as working APIs
            const startDateUpdated = filterBy?.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType
                ? dateUtils.getFormattedStringWeekDayDate(challenge?.startAt)
                : dateUtils.getFormattedStringWeekDayDate(dateUtils.getNearestStartDateByFilter(filterBy?.logType || 'week', startDate));

            const endDateUpdated = filterBy?.logType === DASHBOARD_AVAILABLE_FILTER_TYPES.challenges.logType
                ? dateUtils.getFormattedStringWeekDayDate(challenge?.endAt)
                : getEndDateForDashboard({
                    startDate: startDateUpdated,
                    endDate,
                    period: filterBy?.logType || 'week'
                });

            const apiParams = {
                ownerType,
                ownerId,
                startDate: startDateUpdated,
                endDate: endDateUpdated,
                challengeId: challengeId || '',
                branchId: branchId || '',
                ...(serverSide && {
                    page: currentPage + 1,
                    limit: pageSize,
                    sortBy: currentSort.column,
                    sortOrder: currentSort.direction
                })
            };

            const totalUsers = await fetchDashboardTotalUsers(apiParams);

            let usersListRowsData, totalUsersCount;

            if (serverSide && totalUsers.data && totalUsers.total !== undefined) {
                // Server-side pagination response: { data: [], total: number }
                usersListRowsData = totalUsers.data
                    .filter(user => typeof user === 'object')
                    .map((rowData, index) => ({
                        key: currentPage * pageSize + index + 1,
                        name: rowData?.userFullName || rowData?.fullName || t("global.unknown"),
                        email: rowData?.user?.email || t("global.unknown"),
                        ghg: rowData?.totalGreenhouseGazes || 0,
                        dist: (rowData?.totalDistance / 1000) || 0,
                        activeDays: rowData?.days || "",
                        userId: rowData.userId,
                        lastConnection: rowData?.lastLogin?.value || "",
                        organisationName: rowData?.organisationName || "",
                        branchName: rowData?.branchName || "",
                        packageName: rowData?.packageName || []
                    }));
                totalUsersCount = totalUsers.total;
            } else {
                // Legacy response: array of users
                usersListRowsData = (Array.isArray(totalUsers) ? totalUsers : [])
                    .filter(user => typeof user === 'object')
                    .map((rowData, index) => ({
                        key: index + 1,
                        name: rowData?.userFullName || rowData?.fullName || t("global.unknown"),
                        email: rowData?.user?.email || t("global.unknown"),
                        ghg: rowData?.totalGreenhouseGazes || 0,
                        dist: (rowData?.totalDistance / 1000) || 0,
                        activeDays: rowData?.days || "",
                        userId: rowData.userId,
                        lastConnection: rowData?.lastLogin?.value || "",
                        organisationName: rowData?.organisationName || "",
                        branchName: rowData?.branchName || "",
                        packageName: rowData?.packageName || []
                    }));
                totalUsersCount = usersListRowsData.length;
            }

            setData({ totalUsers, usersListRowsData, userDataForCsv: null });
            setTotalRecords(totalUsersCount);
        } catch (error) {
            console.error('Error loading users data:', error);
            setData({ totalUsers: [], usersListRowsData: [], userDataForCsv: null });
        } finally {
            setLoading(false);
        }
    }, [ownerType, ownerId, startDate, endDate, challengeId, branchId, filterBy, t, serverSide, currentPage, pageSize, currentSort.column, currentSort.direction]);

    // Load data on mount
    useEffect(() => {
        loadData();
    }, [loadData]);

    // Page change handler for server-side pagination
    const handlePageChange = useCallback((newPageIndex) => {
        setCurrentPage(newPageIndex);
    }, []);

    // Sort change handler for server-side sorting
    const handleSortChange = useCallback((sortBy) => {
        const columnId = sortBy[0]?.id;

        // Only allow sorting on specific columns: ghg (GHG) and dist (distance)
        const allowedSortColumns = ['ghg', 'dist'];
        if (!allowedSortColumns.includes(columnId)) {
            return; // Do nothing if column is not in allowed list
        }

        setCurrentSort(prevSort => {
            // If clicking the same column, toggle direction
            if (prevSort.column === columnId) {
                const newDirection = prevSort.direction === 'asc' ? 'desc' : 'asc';
                return { column: columnId, direction: newDirection };
            } else {
                // If clicking a different column, start with asc
                return { column: columnId || '', direction: 'asc' };
            }
        });
        // Reset to first page when sorting changes
        setCurrentPage(0);
    }, []);

    const hasData = data.totalUsers !== null;

    return (
        <Row>
            <Col className="card">
                <div style={{ minHeight: 'auto', position: 'relative' }}>
                    {loading && !hasData ? (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#fff',
                            zIndex: 10
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div className="spinner-border text-primary" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div>
                                <div style={{ marginTop: '16px', color: '#6c757d' }}>
                                    Loading users data...
                                </div>
                            </div>
                        </div>
                    ) : (
                        <DataTableWithExportToCSV
                            rowsData={hasData ? data.usersListRowsData : []}
                            columns={usersListColumns}
                            dataForCSV={data.userDataForCsv}
                            title={t("global.listOfUsers")}
                            filename="users"
                            emptyRowsDescription={t("dashboard_default.no_user")}
                            onClickRow={onClickUserRow}
                            columnsDescriptionDataForCSV={usersListTableDescriptionDataForCSV}
                            sheet1Title={t("global.listOfUsers")}
                            sheet2Title={t("global.description_of_data")}
                            customColumnsSheet1={usersTableCustomColumns}
                            downloadExcelButtonRef={downloadUsersExcelButtonRef}
                            onDownloadClick={onClickDownloadExcelUsers}
                            extraButton={<Link style={{ fontSize: '1rem' }} to={routes.city.allUsers}>{t("dashboard_default.see_all_users")}</Link>}
                            loading={loading}
                            serverSide={serverSide}
                            totalRecords={totalRecords}
                            currentPage={currentPage}
                            onPageChange={handlePageChange}
                            pageSize={pageSize}
                            useModernPagination={true}
                            currentSort={currentSort}
                            onSortChange={handleSortChange}
                        />
                    )}
                </div>
            </Col>
        </Row>
    );
}