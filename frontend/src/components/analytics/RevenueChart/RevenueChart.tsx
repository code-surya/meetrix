import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '@/utils/formatters';
import './RevenueChart.css';

interface RevenueChartProps {
  data: Array<{
    period: string;
    revenue: number;
    payment_count: number;
  }>;
}

const RevenueChart = ({ data }: RevenueChartProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const chartData = data.map((item) => ({
    ...item,
    formattedPeriod: formatDate(item.period),
  }));

  return (
    <div className="revenue-chart">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="formattedPeriod"
            stroke="#666"
            style={{ fontSize: '0.875rem' }}
          />
          <YAxis
            stroke="#666"
            style={{ fontSize: '0.875rem' }}
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            labelStyle={{ color: '#1a1a1a' }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#007bff"
            strokeWidth={2}
            dot={{ fill: '#007bff', r: 4 }}
            name="Revenue"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;

