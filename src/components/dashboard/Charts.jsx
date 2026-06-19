import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import Card, { CardHeader } from '../ui/Card';
import { formatCompactCurrency } from '../../utils/formatters';

const COLORS = ['#1e40af', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2'];

export function BudgetOverviewChart({ projects, payments }) {
  const categoryMap = {};
  projects.forEach((p) => {
    categoryMap[p.category] = categoryMap[p.category] || { category: p.category, budget: 0, spent: 0 };
    categoryMap[p.category].budget += p.budget;
  });
  payments.forEach((pay) => {
    const project = projects.find((p) => p.id === pay.projectId);
    if (project) {
      categoryMap[project.category].spent += pay.amount;
    }
  });

  const data = Object.values(categoryMap);

  return (
    <Card>
      <CardHeader title="Budget vs Spending by Category" subtitle="Allocated budget compared to released payments" />
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tickFormatter={(v) => formatCompactCurrency(v)} tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip
              formatter={(value) => formatCompactCurrency(value)}
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
            />
            <Bar dataKey="budget" name="Budget" fill="#93c5fd" radius={[4, 4, 0, 0]} />
            <Bar dataKey="spent" name="Spent" fill="#1e40af" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function SpendingByWardChart({ wards, projects, payments }) {
  const data = wards.map((ward) => {
    const wardProjects = projects.filter((p) => p.wardId === ward.id);
    const wardProjectIds = new Set(wardProjects.map((p) => p.id));
    const spent = payments.filter((p) => wardProjectIds.has(p.projectId)).reduce((s, p) => s + p.amount, 0);
    return {
      name: `W${ward.number}`,
      fullName: ward.name,
      allocated: ward.allocatedBudget,
      spent,
    };
  });

  return (
    <Card>
      <CardHeader title="Spending by Ward" subtitle="Budget allocation vs actual spending" />
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" tickFormatter={(v) => formatCompactCurrency(v)} tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} width={36} />
            <Tooltip
              formatter={(value) => formatCompactCurrency(value)}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
            />
            <Bar dataKey="allocated" name="Allocated" fill="#6ee7b7" radius={[0, 4, 4, 0]} />
            <Bar dataKey="spent" name="Spent" fill="#059669" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function ProjectStatusChart({ projects }) {
  const statusCounts = projects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    value: count,
  }));

  return (
    <Card>
      <CardHeader title="Project Status" subtitle="Distribution across all wards" />
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function RecentActivity({ updates, projects }) {
  const recent = [...updates]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <Card>
      <CardHeader title="Recent Activity" subtitle="Latest project updates across wards" />
      <div className="space-y-3">
        {recent.map((update) => {
          const project = projects.find((p) => p.id === update.projectId);
          return (
            <div key={update.id} className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="h-2 w-2 rounded-full bg-brand-500 mt-2 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{update.title}</p>
                <p className="text-xs text-slate-500 truncate">{project?.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{update.date} · {update.progressAfter}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
