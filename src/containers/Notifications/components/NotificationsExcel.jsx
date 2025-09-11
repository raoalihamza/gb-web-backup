import React, { PureComponent } from 'react';
// import { ReactExport } from 'react-data-export';
import { Button } from 'reactstrap';
import ReactExport1 from 'react-export-excel';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

class NotificationsExcel extends PureComponent {
	render() {
		const { t, data } = this.props;
		return (
			<div>
				<ReactExport1.ExcelFile
					element={
						<Button type="button" size="sm">{t('dashboard_fitness.excel_button')}</Button>
					}
				>
					<ReactExport1.ExcelFile.ExcelSheet data={data} name="Employees">
						<ReactExport1.ExcelFile.ExcelColumn
							label="ID de la succursale"
							value="notificationId"
						/>
						<ReactExport1.ExcelFile.ExcelColumn
							label="Nom de la succursale"
							value="notificationName"
						/>
						<ReactExport1.ExcelFile.ExcelColumn
							label="Région"
							value="regionName"
						/>
						<ReactExport1.ExcelFile.ExcelColumn
							label="Créé le"
							value="createdOn"
						/>
						<ReactExport1.ExcelFile.ExcelColumn
							label="Dernière mise à jour le"
							value="updatedOn"
						/>
					</ReactExport1.ExcelFile.ExcelSheet>
				</ReactExport1.ExcelFile>
			</div>
		);
	}
}
NotificationsExcel.propTypes = {
	t: PropTypes.func.isRequired,
	data: PropTypes.func.isRequired,
};
export default withTranslation('common')(NotificationsExcel);
