import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const ModernPagination = ({
  gotoPage,
  nextPage,
  previousPage,
  pageIndex,
  pageOptions,
  pageCount,
  canNextPage,
  canPreviousPage,
  disableGoToLastPage = false,
  totalRecords = 0,
  pageSize = 10,
  serverSide = false,
  onPageChange,
}) => {
  const currentPage = pageIndex + 1;
  const totalPages = serverSide ? pageCount : pageOptions.length;
  const startRecord = pageIndex * pageSize + 1;
  const endRecord = Math.min(startRecord + pageSize - 1, totalRecords);

  // Generate page numbers for display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Smart pagination with ellipsis
      if (currentPage <= 3) {
        // Near the beginning
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // In the middle
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };

  const handlePageClick = (page) => {
    if (page === '...' || page === currentPage) return;

    const targetPageIndex = page - 1;
    if (serverSide && onPageChange) {
      onPageChange(targetPageIndex);
    } else {
      gotoPage(targetPageIndex);
    }
  };

  const handlePrevious = () => {
    if (serverSide && onPageChange) {
      onPageChange(pageIndex - 1);
    } else {
      previousPage();
    }
  };

  const handleNext = () => {
    if (serverSide && onPageChange) {
      onPageChange(pageIndex + 1);
    } else {
      nextPage();
    }
  };

  const handleFirst = () => {
    if (serverSide && onPageChange) {
      onPageChange(0);
    } else {
      gotoPage(0);
    }
  };

  const handleLast = () => {
    if (serverSide && onPageChange) {
      onPageChange(totalPages - 1);
    } else {
      gotoPage(pageCount - 1);
    }
  };

  return (
    <div className="modern-pagination">
      <style jsx>{`
        .modern-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-top: 1px solid #e5e7eb;
          background: #ffffff;
          border-radius: 0 0 12px 12px;
        }

        .pagination-info {
          display: flex;
          align-items: center;
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
        }

        .pagination-info .highlight {
          color: #374151;
          font-weight: 600;
          margin: 0 4px;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .page-button {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          height: 40px;
          padding: 0 12px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          color: #374151;
          font-size: 14px;
          font-weight: 500;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
        }

        .page-button:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #d1d5db;
          color: #111827;
        }

        .page-button:active:not(:disabled) {
          background: #f3f4f6;
          transform: translateY(1px);
        }

        .page-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #f9fafb;
          color: #9ca3af;
        }

        .page-button.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: #ffffff;
          font-weight: 600;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        .page-button.active:hover {
          background: #2563eb;
          border-color: #2563eb;
        }

        .page-button.ellipsis {
          border: none;
          background: transparent;
          cursor: default;
          color: #9ca3af;
        }

        .page-button.ellipsis:hover {
          background: transparent;
          border: none;
        }

        .nav-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 16px;
          font-weight: 500;
        }

        .nav-button svg {
          width: 16px;
          height: 16px;
        }

        @media (max-width: 768px) {
          .modern-pagination {
            flex-direction: column;
            gap: 16px;
            padding: 16px;
          }

          .pagination-controls {
            gap: 4px;
          }

          .page-button {
            min-width: 36px;
            height: 36px;
            padding: 0 8px;
            font-size: 13px;
          }

          .nav-button {
            padding: 0 12px;
          }

          .pagination-info {
            font-size: 13px;
          }
        }
      `}</style>

      {/* Records Info */}
      <div className="pagination-info">
        {totalRecords > 0 ? (
          <>
            Showing
            <span className="highlight">{startRecord}</span>
            to
            <span className="highlight">{endRecord}</span>
            of
            <span className="highlight">{totalRecords.toLocaleString()}</span>
            results
          </>
        ) : (
          'No results found'
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          {/* First Page */}
          <button
            className="page-button nav-button"
            onClick={handleFirst}
            disabled={!canPreviousPage}
            title="First page"
          >
            <ChevronsLeft />
            First
          </button>

          {/* Previous Page */}
          <button
            className="page-button nav-button"
            onClick={handlePrevious}
            disabled={!canPreviousPage}
            title="Previous page"
          >
            <ChevronLeft />
            Previous
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              className={`page-button ${page === '...' ? 'ellipsis' : ''} ${
                page === currentPage ? 'active' : ''
              }`}
              onClick={() => handlePageClick(page)}
              disabled={page === '...'}
            >
              {page}
            </button>
          ))}

          {/* Next Page */}
          <button
            className="page-button nav-button"
            onClick={handleNext}
            disabled={!canNextPage}
            title="Next page"
          >
            Next
            <ChevronRight />
          </button>

          {/* Last Page */}
          <button
            className="page-button nav-button"
            onClick={handleLast}
            disabled={!canNextPage || disableGoToLastPage}
            title="Last page"
          >
            Last
            <ChevronsRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default ModernPagination;