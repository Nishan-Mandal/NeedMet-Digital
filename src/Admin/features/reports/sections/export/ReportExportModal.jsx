import React, { useState } from "react";
import { X, Download, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import {
  exportSalesReportCsv,
  exportPaymentLedgerCsv,
  exportEmiScheduleCsv,
  exportPlanPerformanceCsv,
  exportCustomerSalesCsv,
  exportRefundReportCsv,
  exportTimelineSummaryCsv,
} from "../../services/reportExport.service";

export default function ReportExportModal({ isOpen, onClose, data = null, rangeLabel = "Selected Window" }) {
  const [selectedReport, setSelectedReport] = useState("sales");
  const [exporting, setExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const reportOptions = [
    {
      id: "sales",
      title: "1. Comprehensive Sales & Orders Report",
      description: "Full purchase history, plans, categories, payment methods, pricing, discounts, and status.",
    },
    {
      id: "payments",
      title: "2. Gateway Payment Ledger Report",
      description: "Razorpay transaction audit logs, amounts, methods, payment types, banks, and status.",
    },
    {
      id: "emi",
      title: "3. EMI Schedule & Delinquency Report",
      description: "AutoPay cycles, due dates, paid dates, upcoming debits, and overdue delinquency items.",
    },
    {
      id: "plans",
      title: "4. Plan Sales Performance Report",
      description: "Aggregated units sold, gross bookings, full vs EMI breakdown, and average revenue per plan.",
    },
    {
      id: "customers",
      title: "5. Customer Sales Intelligence Report",
      description: "Customer purchasing volume, lifetime spend (LTV), outstanding balances, and repeat status.",
    },
    {
      id: "refunds",
      title: "6. Refund Audit Report",
      description: "Reversed payments, refund IDs, customer names, refund amounts, and timestamps.",
    },
    {
      id: "timeline",
      title: "7. Daily / Interval Sales Summary",
      description: "Time-bucketed summary of gross bookings, collected cash, refunds, and order counts.",
    },
  ];

  const handleDownload = () => {
    setExporting(true);
    setDownloadSuccess(false);

    const timestampStr = new Date().toISOString().split("T")[0];
    const rawPurchases = data?.raw?.currentPurchases || [];
    const rawPayments = data?.raw?.currentPayments || [];

    try {
      switch (selectedReport) {
        case "sales":
          exportSalesReportCsv(rawPurchases, `sales-report-${timestampStr}.csv`);
          break;
        case "payments":
          exportPaymentLedgerCsv(rawPayments, `payment-ledger-${timestampStr}.csv`);
          break;
        case "emi":
          exportEmiScheduleCsv(data?.emiLedger || {}, `emi-schedule-${timestampStr}.csv`);
          break;
        case "plans":
          exportPlanPerformanceCsv(data?.planPerformance || [], `plan-performance-${timestampStr}.csv`);
          break;
        case "customers":
          exportCustomerSalesCsv(data?.customerSales || [], `customer-sales-${timestampStr}.csv`);
          break;
        case "refunds":
          exportRefundReportCsv(rawPayments, `refunds-audit-${timestampStr}.csv`);
          break;
        case "timeline":
          exportTimelineSummaryCsv(data?.timelineBuckets || [], `daily-sales-summary-${timestampStr}.csv`);
          break;
        default:
          break;
      }
      setDownloadSuccess(true);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in font-primary"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200/90 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-[#e8f5ee] text-[#0f5c3e] flex items-center justify-center shrink-0">
              <FileSpreadsheet size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-heading">
                Export Sales & Analytics Reports
              </h2>
              <p className="text-xs text-slate-500">
                Window: <strong className="text-slate-700">{rangeLabel}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Report Selector List */}
        <div className="overflow-y-auto space-y-2 flex-1 pr-1">
          {reportOptions.map((opt) => {
            const isSelected = selectedReport === opt.id;
            return (
              <label
                key={opt.id}
                onClick={() => setSelectedReport(opt.id)}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? "bg-[#e8f5ee]/50 border-[#0f5c3e] shadow-2xs"
                    : "bg-slate-50/60 border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="reportType"
                  value={opt.id}
                  checked={isSelected}
                  onChange={() => setSelectedReport(opt.id)}
                  className="mt-0.5 text-[#0f5c3e] focus:ring-[#0f5c3e]"
                />
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-xs text-slate-900 block">{opt.title}</span>
                  <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                    {opt.description}
                  </span>
                </div>
              </label>
            );
          })}
        </div>

        {/* Download Success Notice */}
        {downloadSuccess && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-[#0f5c3e] font-semibold flex items-center gap-1.5">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>Report successfully downloaded to your device (.csv format).</span>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-3">
          <span className="text-xs text-slate-400 font-medium">Format: CSV (Excel Compatible)</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={exporting}
              className="px-4 py-2 rounded-xl bg-[#0f5c3e] hover:bg-[#1a8a5a] text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
            >
              <Download size={14} />
              <span>{exporting ? "Generating..." : "Download Report"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

