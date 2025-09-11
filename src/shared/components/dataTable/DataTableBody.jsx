export default function DataTableBody({
  getTableBodyProps,
  prepareRow,
  page,
  additionalColumns = (row) => null,
  onClickRow = () => { }
}) {

  return (
    <tbody {...getTableBodyProps()}>
      {page.map((row) => {
        prepareRow(row);
        return (
          <tr {...row.getRowProps()} onClick={() => onClickRow(row.original)}>
            {row.cells.map((cell) => (
              <td {...cell.getCellProps()} className="data-table-data">
                {cell.render("Cell")}
              </td>
            ))}
            {additionalColumns(row)}
          </tr>
        );
      })}
    </tbody>
  );
}
