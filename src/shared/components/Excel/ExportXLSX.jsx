import React from "react";
import * as XLSX from "xlsx";

const ExportXLSX = ({
  element = <button>Download Data</button>,
  sheet1Data = [],
  sheet2Data = [],
  sheet1Title = "Sheet1",
  sheet2Title = "Sheet2",
  filename = "Download.xlsx",
}) => {
  const handleExport = () => {
    // Vérifiez si les données existent
    if (!sheet1Data.length && !sheet2Data.length) {
      console.error("No data available to export");
      return;
    }

    // Ajouter l'extension .xlsx au nom de fichier si elle n'est pas déjà présente
    const finalFilename = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;

    const workbook = XLSX.utils.book_new();

    // Ajouter la première feuille si les données existent
    if (sheet1Data.length) {
      const sheet1 = XLSX.utils.json_to_sheet(sheet1Data);
      XLSX.utils.book_append_sheet(workbook, sheet1, sheet1Title);
    }

    // Ajouter la deuxième feuille si les données existent
    if (sheet2Data.length) {
      const sheet2 = XLSX.utils.json_to_sheet(sheet2Data);
      XLSX.utils.book_append_sheet(workbook, sheet2, sheet2Title);
    }

    // Générer et télécharger le fichier Excel
    XLSX.writeFile(workbook, finalFilename);
  };

  return <div onClick={handleExport}>{element}</div>;
};

export default ExportXLSX;
