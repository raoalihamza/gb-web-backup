export default function DataTableHeader({
    headerGroups,
    sortable
}) {
    return (
        <>
            <style jsx>{`
                .data-table-head-improved {
                    position: relative !important;
                    padding: 12px 8px !important;
                    background: #f8f9fa !important;
                    border-bottom: 2px solid #dee2e6 !important;
                    font-weight: 600 !important;
                    font-size: 13px !important;
                    color: #495057 !important;
                    text-align: left !important;
                    vertical-align: middle !important;
                    white-space: normal !important;
                    overflow: visible !important;
                    min-width: 100px !important;
                    user-select: none !important;
                }

                .data-table-head-improved.sortable:hover {
                    background: #e9ecef !important;
                }

                .data-table-head-improved.non-sortable:hover {
                    background: #f8f9fa !important;
                }

                .header-content {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: space-between !important;
                    width: 100% !important;
                }

                .header-text {
                    overflow: visible !important;
                    white-space: normal !important;
                    flex: 1 !important;
                    margin-right: ${sortable ? '8px' : '0'} !important;
                }

                .sort-indicator {
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    width: 16px !important;
                    height: 16px !important;
                    font-size: 10px !important;
                    color: #6c757d !important;
                    flex-shrink: 0 !important;
                }

                .sort-indicator.active {
                    color: #007bff !important;
                    font-weight: 700 !important;
                }

                .sort-indicator.inactive {
                    opacity: 0.3 !important;
                }

                /* Specific column width adjustments */
                .data-table-head-improved[data-column="name"] {
                    min-width: 120px !important;
                }

                .data-table-head-improved[data-column="email"] {
                    min-width: 160px !important;
                }

                .data-table-head-improved[data-column="organisation"] {
                    min-width: 140px !important;
                }

                .data-table-head-improved[data-column="ghg"] {
                    min-width: 80px !important;
                }

                .data-table-head-improved[data-column="number"] {
                    min-width: 60px !important;
                    text-align: center !important;
                }

                .data-table-head-improved[data-column="status"] {
                    min-width: 100px !important;
                }
            `}</style>
            <thead>
                {headerGroups?.map((headerGroup, groupIndex) => (
                    <tr key={groupIndex} {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map((column, columnIndex) => (
                            <th
                                key={columnIndex}
                                {...(sortable && !column.disableSort ? column.getHeaderProps(column.getSortByToggleProps()) : column.getHeaderProps())}
                                className={`data-table-head-improved ${sortable && !column.disableSort ? 'sortable' : 'non-sortable'}`}
                                data-column={column.id}
                                title={column.render('Header')} // Tooltip for full text
                                style={{ cursor: sortable && !column.disableSort ? 'pointer' : 'default' }}
                            >
                                <div className="header-content">
                                    <span className="header-text">
                                        {column.render('Header')}
                                    </span>
                                    {sortable && !column.disableSort && (
                                        <span
                                            className={`sort-indicator ${
                                                column.isSorted
                                                    ? 'active'
                                                    : column.canSort
                                                        ? 'inactive'
                                                        : ''
                                            }`}
                                        >
                                            {column.isSorted
                                                ? column.isSortedDesc
                                                    ? '▼'
                                                    : '▲'
                                                : '↕'}
                                        </span>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
        </>
    )
}