"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const INDIGO = "#3730a3";
const TEAL = "#0f766e";
const GRID = "#e2e8f0";
const AXIS = "#64748b";

interface Point { label: string; [key: string]: string | number }

export function TrendChart({ data, keys, height = 240 }: { data: Point[]; keys: { key: string; name: string }[]; height?: number }) {
  const colors = [INDIGO, TEAL];
  return (
    <div style={{ height }} role="img" aria-label={`Trend chart of ${keys.map((k) => k.name).join(" and ")} (sample data)`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="label" tick={{ fill: AXIS, fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: AXIS, fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${GRID}`, fontSize: 12 }} />
          {keys.map((k, i) => (
            <Area key={k.key} type="monotone" dataKey={k.key} name={k.name} stroke={colors[i % 2]} fill={colors[i % 2]} fillOpacity={0.1} strokeWidth={2} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SimpleBarChart({ data, dataKey, name, height = 240, color = INDIGO }: { data: Point[]; dataKey: string; name: string; height?: number; color?: string }) {
  return (
    <div style={{ height }} role="img" aria-label={`Bar chart of ${name} (sample data)`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="label" tick={{ fill: AXIS, fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: AXIS, fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 8, border: `1px solid ${GRID}`, fontSize: 12 }} cursor={{ fill: "#f1f5f9" }} />
          <Bar dataKey={dataKey} name={name} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
