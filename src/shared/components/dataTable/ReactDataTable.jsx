import { useTable, useSortBy, usePagination } from "react-table";

import DataTableBody from "./DataTableBody";
import DataTableHeader from "./DataTableHeader";
import DataTablePagination from "./DataTablePagination";
import ModernPaginationSimple from "./ModernPaginationSimple";
import { useEffect, useState } from "react";

const ReactDataTable = ({
  columns,
  rows,
  onClickRow,
  onChangeCell,
  pageSize = 10,
  sortBy = "key",
  desc,
  additionalColumns,
  styles = {},
  onChangePageIndex = (idx) => {},
  disableGoToLastPage = false,
  serverSide = false,
  totalRecords = 0,
  currentPage = 0,
  onPageChange,
  useModernPagination = true,
}) => {
  const [localSortBy, setLocalSortBy] = useState();
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    state: { pageIndex, sortBy: tableSortBy },
  } = useTable(
    {
      columns,
      data: rows,
      initialState: {
        sortBy: localSortBy
          ? localSortBy
          : [
              {
                id: sortBy,
                desc: desc,
              },
            ],
        pageIndex: serverSide ? currentPage : 0,
        pageSize,
      },
      // Server-side pagination configuration
      ...(serverSide && {
        manualPagination: true,
        pageCount: Math.ceil(totalRecords / pageSize),
      }),
      autoResetPage: false,
    },
    useSortBy,
    usePagination
  );

  useEffect(() => {
    if (tableSortBy) {
      setLocalSortBy(tableSortBy);
    }
  }, [tableSortBy]);

  useEffect(() => {
    onChangePageIndex(pageIndex);
  }, [onChangePageIndex, pageIndex]);

  return (
    <>
      <div className="users-table-card-body" style={styles}>
        <table {...getTableProps()} className="data-table">
          <DataTableHeader headerGroups={headerGroups} sortable />
          <DataTableBody
            getTableBodyProps={getTableBodyProps}
            prepareRow={prepareRow}
            page={page}
            onClickRow={onClickRow}
            additionalColumns={additionalColumns}
          />
        </table>
      </div>

      {(serverSide ? totalRecords > pageSize : rows.length > pageSize) && (
        useModernPagination ? (
          <ModernPaginationSimple
            gotoPage={gotoPage}
            nextPage={nextPage}
            previousPage={previousPage}
            pageIndex={serverSide ? currentPage : pageIndex}
            pageOptions={pageOptions}
            pageCount={pageCount}
            canNextPage={canNextPage}
            canPreviousPage={canPreviousPage}
            disableGoToLastPage={disableGoToLastPage}
            totalRecords={serverSide ? totalRecords : rows.length}
            pageSize={pageSize}
            serverSide={serverSide}
            onPageChange={onPageChange}
          />
        ) : (
          <DataTablePagination
            gotoPage={gotoPage}
            nextPage={nextPage}
            previousPage={previousPage}
            pageIndex={pageIndex}
            pageOptions={pageOptions}
            pageCount={pageCount}
            canNextPage={canNextPage}
            canPreviousPage={canPreviousPage}
            disableGoToLastPage={disableGoToLastPage}
          />
        )
      )}
    </>
  );
};

export default ReactDataTable;
