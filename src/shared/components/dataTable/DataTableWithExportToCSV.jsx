import CardBox from "atomicComponents/CardBox";
import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import ExportXLSX from "../Excel/ExportXLSX"; // Importez la nouvelle version
import ReactDataTable from "./ReactDataTable";
import CircularProgress from "@material-ui/core/CircularProgress";

const DataTableWithExportToCSV = ({
  rowsData,
  columns,
  dataForCSV,
  title,
  filename,
  emptyRowsDescription,
  onClickRow = () => { },
  columnsDescriptionDataForCSV,
  sheet1Title,
  sheet2Title,
  customColumnsSheet1,
  customColumnsSheet2,
  onDownloadClick,
  downloadExcelButtonRef,
  extraButton,
  pageSize,
  withSearch = true,
  searchField = 'name',
  loading = false,
  additionalFilterComponent = <></>,
  sortBy,
  onChangeCell,
  serverSide = false,
  totalRecords = 0,
  currentPage = 0,
  onPageChange,
  useModernPagination = true,
}) => {
  const { t } = useTranslation("common");
  const buttonRef = useRef();

  const handleDownloadClick = useCallback(
    async (e) => {
      if (loading) return;
      if (onDownloadClick && downloadExcelButtonRef) {
        await onDownloadClick(e);
      } else {
        buttonRef.current.click();
      }
    },
    [downloadExcelButtonRef, loading, onDownloadClick]
  );

  useEffect(() => {
    if (downloadExcelButtonRef) {
      downloadExcelButtonRef.current = buttonRef.current;
    }
  }, [downloadExcelButtonRef]);

  const [searchValue, setSearchValue] = useState("");

  const filteredRowsData = useMemo(
    () =>
      rowsData.filter((row) =>
        row[searchField]?.toLowerCase().includes(searchValue.toLowerCase())
      ),
    [rowsData, searchField, searchValue]
  );
  return (
    <CardBox>
      <div className="d-flex justify-content-between align-items-center">
        <p className="bold-text">{title}</p>

        <CircularProgress
          style={{
            color: "#4ce1b6",
            ...(!loading
              ? { position: "absolute", width: 0, height: 0, opacity: 0 }
              : {}),
          }}
          size={50}
        />

        <div
          className="d-flex align-items-center mb-4"
          style={{
            gap: "16px",
            ...(loading
              ? { position: "absolute", width: 0, height: 0, opacity: 0 }
              : {}),
          }}
        >
          {extraButton && extraButton}
          <button type="button" className="export-to-csv">
            <div className="export-to-csv-link" onClick={handleDownloadClick}>
              {t("global.exportToCSV")}
            </div>
            <ExportXLSX
              element={<div ref={buttonRef}></div>}
              sheet1Data={dataForCSV}
              sheet1Title={sheet1Title}
              sheet2Data={columnsDescriptionDataForCSV}
              sheet2Title={sheet2Title}
              filename={filename}
              customColumnsSheet1={customColumnsSheet1}
              customColumnsSheet2={customColumnsSheet2}
            />
          </button>
        </div>
      </div>
      {withSearch && (
        <div className="form__form-group-field">
          <input
            style={{
              width: 200,
              height: 30,
              borderRadius: 3,
              borderStyle: "solid",
              borderWidth: 1,
              borderColor: "#144273",
            }}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={t("tables.data_table.search")}
          />
        </div>
      )}

      {additionalFilterComponent}
      <div>
        {rowsData.length > 0 ? (
          <ReactDataTable
            columns={columns}
            rows={serverSide ? rowsData : filteredRowsData}
            onClickRow={onClickRow}
            pageSize={pageSize}
            sortBy={sortBy}
            onChangeCell={onChangeCell}
            serverSide={serverSide}
            totalRecords={totalRecords}
            currentPage={currentPage}
            onPageChange={onPageChange}
            useModernPagination={useModernPagination}
          />
        ) : (
          <span>{emptyRowsDescription}</span>
        )}
      </div>
    </CardBox>
  );
};

export default DataTableWithExportToCSV;
