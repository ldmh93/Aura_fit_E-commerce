"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardStats } from "@/types";
import { formatAmount } from "@/utils";

/**
 * Gráficas del panel. Recharts pesa, así que este módulo se carga de forma
 * diferida desde `charts.ts` y nunca entra al bundle de la tienda.
 */

const axis = {
  stroke: "#8A93A0",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  backgroundColor: "#111111",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  fontSize: 12,
  color: "#fff",
};

const PIE_COLORS = ["#5EA8FF", "#C7D7E8", "#3FD9A0", "#8A93A0", "#E8C46A"];

export function RevenueChart({
  data,
}: {
  data: DashboardStats["revenueByDay"];
}) {
  return (
    <div className="h-64 w-full px-2 py-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="auraFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5EA8FF" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#5EA8FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="date" {...axis} />
          <YAxis
            {...axis}
            tickFormatter={(value: number) => formatAmount(value)}
            width={72}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number) => [formatAmount(value), "Ingresos"]}
            cursor={{ stroke: "rgba(94,168,255,0.3)" }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#5EA8FF"
            strokeWidth={2}
            fill="url(#auraFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlyChart({
  data,
}: {
  data: DashboardStats["revenueByMonth"];
}) {
  return (
    <div className="h-64 w-full px-2 py-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="month" {...axis} />
          <YAxis
            {...axis}
            tickFormatter={(value: number) => formatAmount(value)}
            width={72}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number) => [formatAmount(value), "Ingresos"]}
            cursor={{ fill: "rgba(94,168,255,0.08)" }}
          />
          <Bar dataKey="total" fill="#5EA8FF" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryChart({
  data,
}: {
  data: DashboardStats["salesByCategory"];
}) {
  if (!data.length) {
    return (
      <p className="px-5 py-16 text-center text-sm text-mist">
        Todavía no hay ventas registradas.
      </p>
    );
  }

  return (
    <div className="h-64 w-full py-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="revenue"
            nameKey="category"
            innerRadius={52}
            outerRadius={84}
            paddingAngle={3}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.category}
                fill={PIE_COLORS[index % PIE_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number, name: string) => [
              formatAmount(value),
              name,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
