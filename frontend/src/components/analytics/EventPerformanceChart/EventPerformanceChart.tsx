import { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from 'recharts';
import { formatCurrency } from '@/utils/formatters';
import './EventPerformanceChart.css';

interface EventPerformanceChartProps {
  data: Array<{
    id: number;
    title: string;
    revenue: number;
    attendance_rate: number;
  }>;
}

const EventPerformanceChart = ({ data }: EventPerformanceChartProps) => {
  const chartData = useMemo(() => {
    return data.slice(0, 10).map(event => ({
      ...event,
      x: event.attendance_rate,
      y: event.revenue,
      z: 100, // Bubble size
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="event-performance-tooltip">
          <p className="tooltip-title">{data.title}</p>
          <p className="tooltip-metric">
            Revenue: {formatCurrency(data.revenue)}
          </p>
          <p className="tooltip-metric">
            Attendance Rate: {data.attendance_rate}%
          </p>
        </div>
      );
    }
    return null;
  };

  const totalRevenue = useMemo(() => {
    return data.reduce((sum, event) => sum + event.revenue, 0);
  }, [data]);

  const avgAttendanceRate = useMemo(() => {
    if (data.length === 0) return 0;
    const total = data.reduce((sum, event) => sum + event.attendance_rate, 0);
    return Math.round(total / data.length);
  }, [data]);

  return (
    <div className="event-performance-chart">
      <div className="chart-stats">
        <div className="stat">
          <span className="stat-label">Total Revenue</span>
          <span className="stat-value">{formatCurrency(totalRevenue)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Avg Attendance</span>
          <span className="stat-value">{avgAttendanceRate}%</span>
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              type="number"
              dataKey="x"
              name="Attendance Rate"
              unit="%"
              stroke="#666"
              fontSize={12}
              tickLine={false}
              domain={[0, 100]}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Revenue"
              stroke="#666"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <ZAxis type="number" dataKey="z" range={[60, 400]} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter
              name="Events"
              dataKey="y"
              fill="#007bff"
              fillOpacity={0.6}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-legend">
        <p className="legend-text">
          Each bubble represents an event. Size indicates relative performance.
        </p>
      </div>
    </div>
  );
};

export default EventPerformanceChart;

