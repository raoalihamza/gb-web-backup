export default function DataTableHeader({
    headerGroups,
    sortable
}) {
    return (
        <thead>
            {headerGroups?.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                        <th
                            {...(sortable ? column.getHeaderProps(column.getSortByToggleProps()) : column.getHeaderProps())}
                            className="data-table-head"
                        >
                            {column.render('Header')}
                            {sortable ? (<span className="data-table-sort-tag">
                                {column.isSorted
                                    ? column.isSortedDesc
                                        ? '▼'
                                        : '▲'
                                    : ''}
                            </span>) : null}
                        </th>
                    ))}
                </tr>
            ))}
        </thead>
    )
}