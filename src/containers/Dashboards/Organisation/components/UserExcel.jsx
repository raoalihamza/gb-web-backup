import React, { PureComponent } from 'react';
// import { ReactExport } from 'react-data-export';
import ReactExport1 from 'react-export-excel';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

class UserExcel extends PureComponent {
	render() {
		const { t, data } = this.props;
		return (
			<div>
				<ReactExport1.ExcelFile
					element={
						<button type="button">{t('dashboard_fitness.excel_button')}</button>
					}
				>
					<ReactExport1.ExcelFile.ExcelSheet data={data} name="Employees">
						<ReactExport1.ExcelFile.ExcelColumn label="Nom" value="Nom" />
						<ReactExport1.ExcelFile.ExcelColumn
							label="Adresse courriel"
							value="email"
						/>
						<ReactExport1.ExcelFile.ExcelColumn
							label="GES épargnés (kg CO2 éq.)"
							value="ges_econo"
						/>
						<ReactExport1.ExcelFile.ExcelColumn
							label="Distance (km)"
							value="distance"
						/>
						<ReactExport1.ExcelFile.ExcelColumn
							label="Nombre de jours"
							value="compte_jour"
						/>
						<ReactExport1.ExcelFile.ExcelColumn
							label="Transport habituel"
							value="Transporthabituel"
						/>
						<ReactExport1.ExcelFile.ExcelColumn
							label="Méthode de collecte"
							value="dataCollectionMethod"
						/>
						<ReactExport1.ExcelFile.ExcelColumn
							label="Succursale"
							value="branch_name"
						/>
						<ReactExport1.ExcelFile.ExcelColumn label="Région" value="region" />
						<ReactExport1.ExcelFile.ExcelColumn
							label="Vélo (km)"
							value="Velo"
						/>
						<ReactExport1.ExcelFile.ExcelColumn
							label="Marche (km)"
							value="Marche"
						/>
						<ReactExport1.ExcelFile.ExcelColumn
							label="Course (km)"
							value="Course"
						/>
						<ReactExport1.ExcelFile.ExcelColumn
							label="Covoiturage (km)"
							value="Covoiturage"
						/>
						<ReactExport1.ExcelFile.ExcelColumn
							label="Voiture seul (km)"
							value="voiture_seul"
						/>
						<ReactExport1.ExcelFile.ExcelColumn
							label="Autobus (km)"
							value="Autobus"
						/>
						<ReactExport1.ExcelFile.ExcelColumn
							label="Moto (km)"
							value="moto"
						/>
						<ReactExport1.ExcelFile.ExcelColumn
							label="Autre (km)"
							value="Autre"
						/>
						<ReactExport1.ExcelFile.ExcelColumn
							label="Métro (km)"
							value="Metro"
						/>
						<ReactExport1.ExcelFile.ExcelColumn
							label="Train (km)"
							value="Train"
						/>
						<ReactExport1.ExcelFile.ExcelColumn
							label="Télétravail (km)"
							value="Teletravail"
						/>
						<ReactExport1.ExcelFile.ExcelColumn
							label="Voiture electrique (km)"
							value="Voiture_electrique"
						/>
						<ReactExport1.ExcelFile.ExcelColumn
							label="Voiture electrique covoiturage (km)"
							value="Voiture_elec_co"
						/>
					</ReactExport1.ExcelFile.ExcelSheet>
				</ReactExport1.ExcelFile>
			</div>
		);
	}
}
UserExcel.propTypes = {
	t: PropTypes.func.isRequired,
	data: PropTypes.func.isRequired,
};
export default withTranslation('common')(UserExcel);
