"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardStats } from "@/types";
import { formatAmount } from "@/utils";

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

export function RevenueChart({ data }: { data: DashboardStats["revenueByDay"] }) {
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

export function TopProductsChart({
  data,
}: {
  data: DashboardStats["topProducts"];
}) {
  if (!data.length) {
    return (
      <p className="px-5 py-16 text-center text-sm text-mist">
        Todavía no hay ventas registradas.
      </p>
    );
  }

  return (
    <div className="h-64 w-full px-2 py-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
        >
          <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" {...axis} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            {...axis}
            width={140}
            tickFormatter={(value: string) =>
              value.length > 20 ? `${value.slice(0, 19)}…` : value
            }
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number) => [`${value} piezas`, "Vendidas"]}
            cursor={{ fill: "rgba(94,168,255,0.08)" }}
          />
          <Bar dataKey="units" fill="#C7D7E8" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
