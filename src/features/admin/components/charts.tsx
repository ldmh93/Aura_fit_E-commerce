"use client";

import dynamic from "next/dynamic";

/**
 * Carga diferida de las gráficas.
 * Recharts son ~100 kB: solo se descargan cuando el administrador
 * abre una pantalla que las usa, nunca en la tienda.
 */

const skeleton = () => (
  <div className="shimmer m-4 h-56 rounded-xl bg-white/3" />
);

export const RevenueChart = dynamic(
  () => import("./DashboardCharts").then((m) => m.RevenueChart),
  { ssr: false, loading: skeleton },
);

export const MonthlyChart = dynamic(
  () => import("./DashboardCharts").then((m) => m.MonthlyChart),
  { ssr: false, loading: skeleton },
);

export const CategoryChart = dynamic(
  () => import("./DashboardCharts").then((m) => m.CategoryChart),
  { ssr: false, loading: skeleton },
);
