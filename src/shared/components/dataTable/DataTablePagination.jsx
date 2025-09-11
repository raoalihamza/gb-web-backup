import { Button } from 'reactstrap';

export default function DataTablePagination({
    gotoPage,
    nextPage,
    previousPage,
    pageIndex,
    pageOptions,
    pageCount,
    canNextPage,
    canPreviousPage,
    disableGoToLastPage = false,
}) {
    return (
        <div className="d-flex align-items-center justify-content-center">
            <Button onClick={() => gotoPage(0)} disabled={!canPreviousPage} size="sm" className="data-table-pagination-button">
                {'<<'}
            </Button>
            <Button onClick={() => previousPage()} disabled={!canPreviousPage} size="sm" className="data-table-pagination-button">
                {'<'}
            </Button>
            <span>
                Page{' '}
                <strong>
                    {pageIndex + 1} / {pageOptions.length}
                </strong>
            </span>
            <Button onClick={() => nextPage()} disabled={!canNextPage} size="sm" className="data-table-pagination-button">
                {'>'}
            </Button>
            <Button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage || disableGoToLastPage} size="sm" className="data-table-pagination-button">
                {'>>'}
            </Button>
        </div>
    )
}