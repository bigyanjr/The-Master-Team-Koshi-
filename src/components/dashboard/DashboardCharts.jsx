import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import Card, { CardHeader } from '../ui/Card';
import { formatCompactCurrency } from '../../utils/formatters';
import { getTotalPaid } from '../../utils/riskEngine';

const COLORS = ['#1e40af', '#059669', '#d97706', '#7c3aed', '#0891b2', '#dc2626', '#64748b', '#ea580c'];
const STATUS_COLORS = {
  Planned: '#94a3b8',
  'Tender Open': '#fbbf24',
  Ongoing: '#3b82f6',
  Completed: '#10b981',
  Delayed: '#ef4444',
};

function ChartContainer({ children, empty, emptyMessage }) {
  if (empty) {
    return (
      <div className="h-64 sm:h-72 flex items-center justify-center px-4">
        <p className="text-sm text-slate-500 text-center">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="h-64 sm:h-72 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export function BudgetByWardChart({ wards, projects }) {
  const data = wards.map((ward) => {
    const wardProjects = projects.filter((p) => p.wardNo === ward.number);
    const budget = wardProjects.reduce((s, p) => s + (p.allocatedBudget ?? 0), 0);
    return {
      name: `Ward ${ward.number}`,
      budget,
    };
  }).filter((d) => d.budget > 0);

  return (
    <Card className="min-w-0">
      <CardHeader title="Budget by Ward" subtitle="Published project budget by ward" />
      <ChartContainer
        empty={data.length === 0}
        emptyMessage="No published budget data yet."
      >
        <BarChart data={data.length ? data : wards.map((w) => ({ name: `Ward ${w.number}`, budget: 0 }))} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
          <YAxis tickFormatter={(v) => formatCompactCurrency(v)} tick={{ fontSize: 11, fill: '#64748b' }} />
          <Tooltip
            formatter={(value) => formatCompactCurrency(value)}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
          />
          <Bar dataKey="budget" name="Published Budget" fill="#1e40af" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </Card>
  );
}

export function BudgetByCategoryPieChart({ projects }) {
  const categoryMap = {};
  projects.forEach((p) => {
    categoryMap[p.category] = (categoryMap[p.category] || 0) + (p.allocatedBudget ?? 0);
  });

  const data = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  return (
    <Card className="min-w-0">
      <CardHeader title="Budget by Category" subtitle="Allocated budget distribution" />
      <ChartContainer
        empty={data.length === 0}
        emptyMessage="No budget data for the selected ward filter."
      >
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatCompactCurrency(value)}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} layout="horizontal" verticalAlign="bottom" />
        </PieChart>
      </ChartContainer>
    </Card>
  );
}

export function BudgetUsedRemainingBarChart({ projects }) {
  const totalBudget = projects.reduce((s, p) => s + (p.allocatedBudget ?? 0), 0);
  const budgetUsed = projects.reduce((s, p) => s + getTotalPaid(p), 0);
  const remaining = Math.max(0, totalBudget - budgetUsed);

  const data = [{ name: 'Municipality', used: budgetUsed, remaining }];

  return (
    <Card className="min-w-0">
      <CardHeader title="Budget Used vs Remaining" subtitle="Total released payments against allocation" />
      <ChartContainer
        empty={totalBudget === 0}
        emptyMessage="No budget allocation data available."
      >
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis type="number" tickFormatter={(v) => formatCompactCurrency(v)} tick={{ fontSize: 11, fill: '#64748b' }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} width={90} />
          <Tooltip
            formatter={(value) => formatCompactCurrency(value)}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="used" name="Budget Used" stackId="a" fill="#1e40af" radius={[0, 0, 0, 0]} />
          <Bar dataKey="remaining" name="Remaining" stackId="a" fill="#6ee7b7" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ChartContainer>
    </Card>
  );
}

export function ProjectsByStatusChart({ projects }) {
  const statusCounts = projects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(statusCounts).map(([name, count]) => ({
    name,
    count,
    fill: STATUS_COLORS[name] || '#64748b',
  }));

  return (
    <Card className="min-w-0">
      <CardHeader title="Projects by Status" subtitle="Current lifecycle breakdown" />
      <ChartContainer
        empty={data.length === 0}
        emptyMessage="No projects match the current filter."
      >
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-20} textAnchor="end" height={50} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
          <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
          <Bar dataKey="count" name="Projects" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </Card>
  );
}
