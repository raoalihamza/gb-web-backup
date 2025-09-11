import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { makeStyles } from '@material-ui/core/styles';
import styled from 'styled-components';
import { useTranslation } from "react-i18next";

const useStyles = makeStyles({
  chartContainer: {
    margin: 'auto'
  }
});

const Title = styled.div`
  font-size: 16px;
  margin-left: 12px;
`;

const SubTitle = styled.div`
  font-size: 12px;
  margin-left: 12px;
`;

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const SalesCategoryPieChart = ({ data }) => {
  const { t } = useTranslation('common');
  const styles = useStyles();

  return (
    <>
      <Title>{t('dashboard_commerce.by_category')}</Title>
      <div style={{margin: 'auto'}}>
        <ResponsiveContainer width="100%" height={420} margin={'auto'} className={styles.chartContainer}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend layout="horizontal" verticalAlign="bottom" align="center" margin={{top: 20}}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </>
  )
};

export default SalesCategoryPieChart;
