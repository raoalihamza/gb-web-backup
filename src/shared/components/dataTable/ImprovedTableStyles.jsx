import React from 'react';

export const ImprovedTableStyles = () => (
    <style jsx global>{`
        /* Improved data table container */
        .users-table-card-body {
            overflow-x: auto !important;
            overflow-y: visible !important;
            max-width: 100% !important;
            border-radius: 8px !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
        }

        /* Data table improvements */
        .data-table {
            width: 100% !important;
            border-collapse: collapse !important;
            background: white !important;
            font-size: 14px !important;
            table-layout: auto !important;
            min-width: 800px !important; /* Ensure minimum width for proper display */
            color: #495057 !important;
        }

        /* Table body styling */
        .data-table tbody tr {
            border-bottom: 1px solid #e9ecef !important;
            transition: background-color 0.15s ease !important;
        }

        .data-table tbody tr:hover {
            background-color: #f8f9fa !important;
        }

        .data-table tbody tr:last-child {
            border-bottom: none !important;
        }

        /* Table cell improvements */
        .data-table tbody td {
            padding: 12px 8px !important;
            vertical-align: middle !important;
            border: none !important;
            min-width: 100px !important;
            overflow: visible !important;
            white-space: normal !important;
            word-wrap: break-word !important;
            color: #495057 !important;
            font-size: 14px !important;
            line-height: 1.5 !important;
        }

        /* Specific cell adjustments */
        .data-table tbody td[data-cell="name"] {
            min-width: 120px !important;
            font-weight: 500 !important;
        }

        .data-table tbody td[data-cell="email"] {
            min-width: 180px !important;
            color: #6c757d !important;
        }

        .data-table tbody td[data-cell="email"]:hover {
            color: #495057 !important;
        }

        .data-table tbody td[data-cell="organisation"] {
            min-width: 140px !important;
        }

        .data-table tbody td[data-cell="ghg"] {
            min-width: 100px !important;
            text-align: right !important;
            font-family: 'Courier New', monospace !important;
        }

        .data-table tbody td[data-cell="number"] {
            min-width: 80px !important;
            text-align: center !important;
            font-weight: 500 !important;
        }

        .data-table tbody td[data-cell="status"] {
            min-width: 120px !important;
        }

        .data-table tbody td[data-cell="actions"] {
            min-width: 100px !important;
            text-align: center !important;
        }

        /* Ensure text is visible on hover */
        .data-table tbody td:hover {
            background-color: rgba(0, 123, 255, 0.1) !important;
            color: #495057 !important;
        }

        .data-table thead th:hover {
            position: relative !important;
            z-index: 10 !important;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
            .users-table-card-body {
                overflow-x: scroll !important;
                -webkit-overflow-scrolling: touch !important;
            }

            .data-table {
                min-width: 600px !important;
                font-size: 12px !important;
            }

            .data-table thead th,
            .data-table tbody td {
                padding: 8px 4px !important;
            }
        }

        /* Sorting states */
        .data-table thead th.sortable {
            background-color: #f1f3f4 !important;
        }

        .data-table thead th.sorted {
            background-color: #e8f0fe !important;
        }

        /* Loading state */
        .data-table.loading {
            opacity: 0.6 !important;
            pointer-events: none !important;
        }

        /* Empty state */
        .data-table-empty {
            text-align: center !important;
            padding: 40px 20px !important;
            color: #6c757d !important;
            font-style: italic !important;
        }

        /* Force text visibility - override any conflicting styles */
        .data-table tbody td * {
            color: inherit !important;
            opacity: 1 !important;
            visibility: visible !important;
        }

        .data-table tbody td {
            opacity: 1 !important;
            visibility: visible !important;
        }
    `}</style>
);

export default ImprovedTableStyles;