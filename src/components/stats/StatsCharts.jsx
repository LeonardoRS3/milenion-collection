import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Area, AreaChart,
} from "recharts";

const GLASS = "glass rounded-xl p-4";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/50 rounded-lg px-3 py-2 text-xs font-body shadow-xl">
      {label && <p className="text-muted-foreground mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }}>
          {p.name || p.dataKey}: <span className="font-semibold text-foreground">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function StatsCharts({ stats }) {
  const typeData = Object.entries(stats.byType).map(([name, value]) => ({ name, value }));
  const rarityData = Object.entries(stats.byRarity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name: name.replace(" Rare", "").replace("Secret", "Secreta"), value }));
  const monthlyData = stats.monthly.map((m) => ({ name: m.label, Cartas: m.count }));

  const TYPE_COLORS = ["#7c3aed", "#3b82f6", "#f59e0b", "#06b6d4"];
  const RARITY_COLORS = ["#6b7280", "#3b82f6", "#a855f7", "#f59e0b", "#ec4899", "#22c55e"];

  return (
    <div className="space-y-4">
      {/* Pie: by type */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={GLASS}>
        <p className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Distribuição por Tipo</p>
        {typeData.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">Sem dados</p>
        ) : (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={140}>
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={3}>
                  {typeData.map((_, i) => (
                    <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 flex-1">
              {typeData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: TYPE_COLORS[i % TYPE_COLORS.length] }} />
                  <span className="text-xs font-body text-muted-foreground flex-1">{d.name}</span>
                  <span className="text-xs font-semibold font-body">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Bar: by rarity */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={GLASS}>
        <p className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Distribuição por Raridade</p>
        {rarityData.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">Sem dados</p>
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={rarityData} margin={{ left: -20, right: 4, top: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Cartas" radius={[4, 4, 0, 0]}>
                {rarityData.map((_, i) => (
                  <Cell key={i} fill={RARITY_COLORS[i % RARITY_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Area: monthly evolution */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={GLASS}>
        <p className="font-display text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Evolução Mensal</p>
        <ResponsiveContainer width="100%" height={130}>
          <AreaChart data={monthlyData} margin={{ left: -20, right: 4, top: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="gradCol" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="Cartas" stroke="#7c3aed" strokeWidth={2} fill="url(#gradCol)" dot={{ fill: "#7c3aed", r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}