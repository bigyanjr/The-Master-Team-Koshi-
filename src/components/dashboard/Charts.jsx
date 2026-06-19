import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import Card, { CardHeader } from '../ui/Card';
import { formatCompactCurrency } from '../../utils/formatters';
import { getTotalPaid, calculateTrustScore } from '../../utils/riskEngine';

const COLORS = ['#1e40af', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#64748b', '#ea580c'];

export function BudgetOverviewChart({ projects }) {
  const categoryMap = {};
  projects.forEach((p) => {
    categoryMap[p.category] = categoryMap[p.category] || { category: p.category, budget: 0, spent: 0 };
    categoryMap[p.category].budget += p.allocatedBudget ?? 0;
    categoryMap[p.category].spent += getTotalPaid(p);
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

export function SpendingByWardChart({ wards, projects }) {
  const data = wards.map((ward) => {
    const wardProjects = projects.filter((p) => p.wardNo === ward.number);
    const spent = wardProjects.reduce((s, p) => s + getTotalPaid(p), 0);
    const projectBudget = wardProjects.reduce((s, p) => s + (p.allocatedBudget ?? 0), 0);
    return {
      name: `W${ward.number}`,
      fullName: ward.name,
      allocated: ward.allocatedBudget,
      spent,
      projectBudget,
    };
  });

  return (
    <Card>
      <CardHeader title="Spending by Ward" subtitle="Ward allocation vs actual project spending" />
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
            <Bar dataKey="allocated" name="Ward Budget" fill="#6ee7b7" radius={[0, 4, 4, 0]} />
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
    name: status,
    value: count,
  }));

  return (
    <Card>
      <CardHeader title="Project Status" subtitle="Distribution across all wards" />
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
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

export function RecentActivity({ projects, limit = 5 }) {
  const events = [];

  projects.forEach((project) => {
    (project.payments ?? []).forEach((payment, i) => {
      events.push({
        id: `pay-${project.id}-${i}`,
        date: payment.date,
        title: payment.milestone,
        subtitle: project.title,
        detail: formatCompactCurrency(payment.amount),
      });
    });
    (project.proofs ?? []).forEach((proof, i) => {
      events.push({
        id: `proof-${project.id}-${i}`,
        date: proof.uploadedAt,
        title: proof.title,
        subtitle: project.title,
        detail: proof.type,
      });
    });
  });

  const recent = events.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);

  return (
    <Card>
      <CardHeader title="Recent Activity" subtitle="Latest payments and proof uploads" />
      <div className="space-y-3">
        {recent.map((event) => (
          <div key={event.id} className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="h-2 w-2 rounded-full bg-brand-500 mt-2 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{event.title}</p>
              <p className="text-xs text-slate-500 truncate">{event.subtitle}</p>
              <p className="text-xs text-slate-400 mt-0.5">{event.date} · {event.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function TrustScoreChart({ projects }) {
  const data = projects.map((p) => ({
    name: `W${p.wardNo}`,
    title: p.title.length > 18 ? `${p.title.slice(0, 18)}…` : p.title,
    score: calculateTrustScore(p),
  }));

  return (
    <Card>
      <CardHeader title="Trust Scores" subtitle="Per-project transparency rating" />
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip
              labelFormatter={(_, payload) => payload?.[0]?.payload?.title || ''}
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
            />
            <Bar dataKey="score" name="Trust Score" fill="#1e40af" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
