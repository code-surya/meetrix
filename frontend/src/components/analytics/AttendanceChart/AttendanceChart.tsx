import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import './AttendanceChart.css';

interface AttendanceChartProps {
  data: Array<{
    date: string;
    check_ins: number;
  }>;
}

const AttendanceChart = ({ data }: AttendanceChartProps) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      formattedDate: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    }));
  }, [data]);

  const totalAttendance = useMemo(() => {
    return data.reduce((sum, item) => sum + item.check_ins, 0);
  }, [data]);

  const averageAttendance = useMemo(() => {
    return data.length > 0 ? Math.round(totalAttendance / data.length) : 0;
  }, [totalAttendance, data.length]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="attendance-tooltip">
          <p className="tooltip-date">{label}</p>
          <p className="tooltip-attendance">
            Check-ins: {data.check_ins}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="attendance-chart">
      <div className="chart-stats">
        <div className="stat">
          <span className="stat-label">Total Check-ins</span>
          <span className="stat-value">{totalAttendance}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Avg Daily</span>
          <span className="stat-value">{averageAttendance}</span>
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#28a745" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#28a745" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="formattedDate"
              stroke="#666"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#666"
              fontSize={12}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="check_ins"
              stroke="#28a745"
              strokeWidth={2}
              fill="url(#attendanceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttendanceChart;

