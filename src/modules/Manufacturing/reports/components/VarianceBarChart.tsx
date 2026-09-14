import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { useIntl } from 'react-intl';

import MainCard from 'ui-component/cards/MainCard';
import type { ProductionCostVarianceDto } from '../types/manufacturingReports.types';

type Props = {
  data?: ProductionCostVarianceDto[] | ProductionCostVarianceDto | null;
};

export default function VarianceBarChart({ data }: Props) {
  const intl = useIntl();
  const rows = Array.isArray(data) ? data : data ? [data] : [];
  const material = rows.reduce((sum, row) => sum + (row.materialVariance ?? 0), 0);
  const labor = rows.reduce((sum, row) => sum + (row.laborVariance ?? 0), 0);
  const overhead = rows.reduce((sum, row) => sum + (row.overheadVariance ?? 0), 0);

  const options: ApexOptions = {
    chart: { toolbar: { show: false }, fontFamily: 'inherit' },
    colors: ['#2563eb'],
    dataLabels: { enabled: false },
    grid: { strokeDashArray: 4 },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '45%',
        distributed: true
      }
    },
    xaxis: {
      categories: [
        intl.formatMessage({ id: 'material-cost', defaultMessage: 'Material' }),
        intl.formatMessage({ id: 'labor-cost', defaultMessage: 'Labor' }),
        intl.formatMessage({ id: 'overhead-cost', defaultMessage: 'Overhead' })
      ]
    },
    yaxis: {
      labels: {
        formatter: (value) => (value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })
      }
    },
    tooltip: {
      y: {
        formatter: (value) => (value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      }
    }
  };

  return (
    <MainCard title={intl.formatMessage({ id: 'variance-by-cost-bucket', defaultMessage: 'Variance by Cost Bucket' })}>
      <ReactApexChart options={options} series={[{ name: intl.formatMessage({ id: 'cost-variance', defaultMessage: 'Variance' }), data: [material, labor, overhead] }]} type="bar" height={300} />
    </MainCard>
  );
}
