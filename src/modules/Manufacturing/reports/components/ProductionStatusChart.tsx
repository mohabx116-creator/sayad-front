import { useIntl } from 'react-intl';
import ReactApexChart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';
import { ManufacturingDashboardDto } from '../types/manufacturingReports.types';
import MainCard from 'ui-component/cards/MainCard';

interface Props {
  data?: ManufacturingDashboardDto;
}

const ProductionStatusChart = ({ data }: Props) => {
  const theme = useTheme();
  const intl = useIntl();

  if (!data) return null;

  const series = [data.releasedOrdersCount, data.inProgressOrdersCount, data.completedTodayCount];
  
  const options: any = {
    chart: {
      type: 'donut'
    },
    labels: [
      intl.formatMessage({ id: 'released', defaultMessage: 'Released' }),
      intl.formatMessage({ id: 'in-progress', defaultMessage: 'In Progress' }),
      intl.formatMessage({ id: 'completed-today', defaultMessage: 'Completed Today' })
    ],
    colors: [theme.palette.info.main, theme.palette.warning.main, theme.palette.success.main],
    legend: {
      show: true,
      position: 'bottom'
    },
    dataLabels: {
      enabled: true
    }
  };

  return (
    <MainCard title={intl.formatMessage({ id: 'production-status-distribution', defaultMessage: 'Production Status Distribution' })}>
      <ReactApexChart options={options} series={series} type="donut" height={300} />
    </MainCard>
  );
};

export default ProductionStatusChart;
