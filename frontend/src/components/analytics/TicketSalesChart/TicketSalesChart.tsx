import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import './TicketSalesChart.css';

interface TicketSalesChartProps {
  data: Array<{
    date: string;
    tickets: number;
  }>;
}

const TicketSalesChart = ({ data }: TicketSalesChartProps) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      formattedDate: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    }));
  }, [data]);

  const totalTickets = useMemo(() => {
    return data.reduce((sum, item) => sum + item.tickets, 0);
  }, [data]);

  const peakDay = useMemo(() => {
    if (data.length === 0) return null;
    const maxTickets = Math.max(...data.map(item => item.tickets));
    const peakItem = data.find(item => item.tickets === maxTickets);
    return peakItem ? new Date(peakItem.date).toLocaleDateString() : null;
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="ticket-sales-tooltip">
          <p className="tooltip-date">{label}</p>
          <p className="tooltip-tickets">
            Tickets Sold: {data.tickets}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="ticket-sales-chart">
      <div className="chart-stats">
        <div className="stat">
          <span className="stat-label">Total Tickets</span>
          <span className="stat-value">{totalTickets}</span>
        </div>
        {peakDay && (
          <div className="stat">
            <span className="stat-label">Peak Day</span>
            <span className="stat-value">{peakDay}</span>
          </div>
        )}
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
            <Bar
              dataKey="tickets"
              fill="#007bff"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TicketSalesChart;
