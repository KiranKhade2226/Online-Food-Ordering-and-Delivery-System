import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function TrendChart({ points }) {
  return (
    <div className="admin-chart">
      <div className="admin-chart-header">
        <div>
          <span className="eyebrow eyebrow-light">Orders and revenue</span>
          <h3>Activity pulse</h3>
        </div>
        <p>Combined daily orders and revenue using a chart library.</p>
      </div>
      <div className="admin-chart-surface">
        {points.length ? (
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={points}>
              <CartesianGrid stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="_id" stroke="#d6cbc1" tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="#d6cbc1" tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#d6cbc1" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(10, 14, 22, 0.96)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '16px',
                  color: '#fff',
                }}
              />
              <Bar yAxisId="left" dataKey="count" barSize={28} radius={[12, 12, 0, 0]} fill="#f9c74f" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#3dd6d0" strokeWidth={3} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state">No order history yet.</div>
        )}
      </div>
    </div>
  );
}