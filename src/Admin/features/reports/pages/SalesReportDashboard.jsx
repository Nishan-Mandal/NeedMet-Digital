import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../../../hooks/useAuth";
import useSalesReportQuery from "../hooks/useSalesReportQuery";
import { TIMEFRAME_PRESETS } from "../utils/salesDateBuckets.utils";

import SalesKpiGridSection from "../sections/overview/SalesKpiGridSection";
import SalesConversionSummary from "../sections/overview/SalesConversionSummary";
import RevenueTimelineChart from "../sections/charts/RevenueTimelineChart";
import PeriodComparisonChart from "../sections/charts/PeriodComparisonChart";
import PaymentMethodDonut from "../sections/charts/PaymentMethodDonut";
import PlanSalesBarChart from "../sections/charts/PlanSalesBarChart";
import EmiHealthOverviewSection from "../sections/emi/EmiHealthOverviewSection";
import UpcomingInstallmentsTable from "../sections/emi/UpcomingInstallmentsTable";
import OverdueInstallmentsTable from "../sections/emi/OverdueInstallmentsTable";
import PlanPerformanceSection from "../sections/plans/PlanPerformanceSection";
import TopCustomersSalesSection from "../sections/customers/TopCustomersSalesSection";
import ReportExportModal from "../sections/export/ReportExportModal";

import {
  Calendar,
  Download,
  RefreshCw,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

export default function SalesReportDashboard() {
  const { currentUser, isAdmin, isStaff, authLoading } = useAuth();
  const navigate = useNavigate();

  // Selected timeframe filter state
  const [timeframe, setTimeframe] = useState("30d");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // RBAC Access Guard: Only admins or authorized staff
  useEffect(() => {
    if (!authLoading && (!currentUser || (!isAdmin && !isStaff))) {
      navigate("/login?redirect=/admin/reports");
    }
  }, [currentUser, isAdmin, isStaff, authLoading, navigate]);

  const {
    data: reportData,
    isLoading: loading,
    isRefetching,
    refetch,
    error,
  } = useSalesReportQuery({
    timeframe,
    customRange: timeframe === "custom" && customRange.start && customRange.end ? customRange : null,
  });

  const rangeLabel = reportData?.rangeConfig?.label || "Last 30 Days";
  const metrics = reportData?.metrics;
  const timelineBuckets = reportData?.timelineBuckets || [];
  const planPerformance = reportData?.planPerformance || [];
  const customerSales = reportData?.customerSales || [];
  const emiLedger = reportData?.emiLedger || { overdue: [], upcoming: [] };
  const rawPayments = reportData?.raw?.currentPayments || [];

  return (
    <div className="space-y-6 w-full font-primary pb-8">
      {/* ── Top Control & Timeframe Toolbar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Preset Timeframe Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {TIMEFRAME_PRESETS.map((preset) => {
            const isSelected = timeframe === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setTimeframe(preset.id);
                  if (preset.id === "custom") setShowCustomPicker(true);
                  else setShowCustomPicker(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer shadow-2xs ${
                  isSelected
                    ? "bg-[#0f5c3e] text-white border border-[#0f5c3e] shadow-xs font-bold"
                    : "bg-slate-50 text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/70"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Action Controls (Custom Date, Refresh, Export) */}
        <div className="flex items-center gap-2 shrink-0">
          {timeframe === "custom" && (
            <div className="flex items-center gap-1.5 text-xs">
              <input
                type="date"
                value={customRange.start}
                onChange={(e) => setCustomRange((prev) => ({ ...prev, start: e.target.value }))}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-[#0f5c3e]"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={customRange.end}
                onChange={(e) => setCustomRange((prev) => ({ ...prev, end: e.target.value }))}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-[#0f5c3e]"
              />
            </div>
          )}

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={loading || isRefetching}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-[#0f5c3e] border border-slate-200 transition cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
            title="Refresh analytics data"
          >
            <RefreshCw size={15} className={loading || isRefetching ? "animate-spin text-[#0f5c3e]" : ""} />
          </button>

          {/* Export Report CTA */}
          <button
            type="button"
            onClick={() => setExportModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#0f5c3e] hover:bg-[#1a8a5a] text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs hover:shadow active:scale-95"
          >
            <Download size={14} />
            <span>Export Reports</span>
          </button>
        </div>
      </div>

      {/* Error Alert if query fails */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>Failed to load sales report: {error.message}. Please check your database permissions.</span>
        </div>
      )}

      {/* ── Section 1: 8 Primary Financial KPI Cards ── */}
      <SalesKpiGridSection metrics={metrics} loading={loading} />

      {/* ── Section 2: Order Pipeline & Gateway Success Summary ── */}
      <SalesConversionSummary metrics={metrics} loading={loading} />

      {/* ── Section 3: Revenue & Trend Charts ── */}
      <RevenueTimelineChart buckets={timelineBuckets} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Period over period comparison */}
        <PeriodComparisonChart metrics={metrics} rangeConfig={reportData?.rangeConfig} loading={loading} />
        {/* Payment instruments breakdown */}
        <PaymentMethodDonut rawPayments={rawPayments} loading={loading} />
      </div>

      {/* Top 5 Ranked Selling Plans */}
      <PlanSalesBarChart plans={planPerformance} loading={loading} />

      {/* ── Section 4: EMI Portfolio & Delinquency Tracking ── */}
      <div className="space-y-4 pt-2">
        <EmiHealthOverviewSection metrics={metrics} loading={loading} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <UpcomingInstallmentsTable upcoming={emiLedger.upcoming} loading={loading} />
          <OverdueInstallmentsTable overdue={emiLedger.overdue} loading={loading} />
        </div>
      </div>

      {/* ── Section 5: Plan Performance Breakdown ── */}
      <PlanPerformanceSection plans={planPerformance} loading={loading} />

      {/* ── Section 6: Customer Purchasing Intelligence ── */}
      <TopCustomersSalesSection customers={customerSales} loading={loading} />

      {/* ── Export Modal ── */}
      <ReportExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        data={reportData}
        rangeLabel={rangeLabel}
      />
    </div>
  );
}

