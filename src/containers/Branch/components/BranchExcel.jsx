import React, { PureComponent } from 'react';
import { Button } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import * as XLSX from 'xlsx';

class BranchExcel extends PureComponent {
	// Fonction pour exporter les données
	exportToExcel = () => {
		const { data, t } = this.props;

		// Formatage des données pour l'export
		const formattedData = data.map((item) => ({
			[t('dashboard_fitness.branch_id')]: item.branchId,
			[t('dashboard_fitness.branch_name')]: item.branchName,
			[t('dashboard_fitness.region')]: item.regionName,
			[t('dashboard_fitness.created_on')]: item.createdOn,
			[t('dashboard_fitness.updated_on')]: item.updatedOn,
		}));

		// Création de la feuille Excel
		const worksheet = XLSX.utils.json_to_sheet(formattedData);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, t('dashboard_fitness.sheet_name'));

		// Génération et téléchargement du fichier Excel
		XLSX.writeFile(workbook, `${t('dashboard_fitness.file_name')}.xlsx`);
	};

	render() {
		const { t } = this.props;

		return (
			<div>
				<Button type="button" size="sm" onClick={this.exportToExcel}>
					{t('dashboard_fitness.excel_button')}
				</Button>
			</div>
		);
	}
}

BranchExcel.propTypes = {
	t: PropTypes.func.isRequired,
	data: PropTypes.arrayOf(
		PropTypes.shape({
			branchId: PropTypes.string.isRequired,
			branchName: PropTypes.string.isRequired,
			regionName: PropTypes.string.isRequired,
			createdOn: PropTypes.string.isRequired,
			updatedOn: PropTypes.string.isRequired,
		})
	).isRequired,
};

export default withTranslation('common')(BranchExcel);
