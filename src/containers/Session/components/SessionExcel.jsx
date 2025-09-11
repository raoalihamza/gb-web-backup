import React, { PureComponent } from 'react';
// import { ReactExport } from 'react-data-export';
import ReactExport1 from 'react-export-excel';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

class SessionExcel extends PureComponent {
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
						<ReactExport1.ExcelFile.ExcelColumn
							label="Créé le"
							value="created_at"
						/>
						<ReactExport1.ExcelFile.ExcelColumn
							label="Mode de transport"
							value="transport_mode"
						/>
						<ReactExport1.ExcelFile.ExcelColumn
							label="Distance"
							value="Distance"
						/>
					</ReactExport1.ExcelFile.ExcelSheet>
				</ReactExport1.ExcelFile>
			</div>
		);
	}
}
SessionExcel.propTypes = {
	t: PropTypes.func.isRequired,
	data: PropTypes.func.isRequired,
};
export default withTranslation('common')(SessionExcel);
