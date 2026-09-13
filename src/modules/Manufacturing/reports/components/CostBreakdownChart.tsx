import { useIntl } from 'react-intl';
import ReactApexChart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';
import MainCard from 'ui-component/cards/MainCard';
import { ProductionCostAnalysisDto } from '../types/manufacturingReports.types';

interface Props {
  data?: ProductionCostAnalysisDto[];
}

const CostBreakdownChart = ({ data }: Props) => {
  const theme = useTheme();
  const intl = useIntl();

  if (!data || data.length === 0) return null;

  const totalMaterial = data.reduce((acc, curr) => acc + curr.materialCost, 0);
  const totalLabor = data.reduce((acc, curr) => acc + curr.laborCost, 0);
  const totalOverhead = data.reduce((acc, curr) => acc + curr.overheadCost, 0);

  const series = [totalMaterial, totalLabor, totalOverhead];
  
  const options: any = {
    chart: {
      type: 'pie'
    },
    labels: [
      intl.formatMessage({ id: 'material-cost', defaultMessage: 'Material Cost' }),
      intl.formatMessage({ id: 'labor-cost', defaultMessage: 'Labor Cost' }),
      intl.formatMessage({ id: 'overhead-cost', defaultMessage: 'Overhead Cost' })
    ],
    colors: [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.error.main],
    legend: {
      show: true,
      position: 'bottom'
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number, opts: any) => {
        return opts.w.globals.seriesTotals[opts.seriesIndex].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
    }
  };

  return (
    <MainCard title={intl.formatMessage({ id: 'cost-breakdown', defaultMessage: 'Cost Breakdown' })}>
      <ReactApexChart options={options} series={series} type="pie" height={300} />
    </MainCard>
  );
};

export default CostBreakdownChart;
