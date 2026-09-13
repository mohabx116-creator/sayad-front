import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

import MainCard from 'ui-component/cards/MainCard';
import type { ProductionCostVarianceDto } from '../types/manufacturingReports.types';

type Props = {
  data?: ProductionCostVarianceDto[] | ProductionCostVarianceDto | null;
};

export default function VarianceBarChart({ data }: Props) {
  const rows = Array.isArray(data) ? data : data ? [data] : [];
  const material = rows.reduce((sum, row) => sum + row.materialVariance, 0);
  const labor = rows.reduce((sum, row) => sum + row.laborVariance, 0);
  const overhead = rows.reduce((sum, row) => sum + row.overheadVariance, 0);

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
    xaxis: { categories: ['Material', 'Labor', 'Overhead'] },
    yaxis: {
      labels: {
        formatter: (value) => value.toLocaleString(undefined, { maximumFractionDigits: 0 })
      }
    },
    tooltip: {
      y: {
        formatter: (value) => value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      }
    }
  };

  return (
    <MainCard title="Variance by Cost Bucket">
      <ReactApexChart options={options} series={[{ name: 'Variance', data: [material, labor, overhead] }]} type="bar" height={300} />
    </MainCard>
  );
}
