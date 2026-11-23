import { lazy } from "react";
import { Navigate } from "react-router-dom";

const PlansDashboard = lazy(() => import("../features/plans/pages/PlansDashboard"));
const PlanForm = lazy(() => import("../features/plans/pages/PlanForm"));
const Coupons = lazy(() => import("../features/coupons/pages/Coupons"));
const CashCodes = lazy(() => import("../features/cashcodes/pages/CashCodes"));
const Transactions = lazy(() => import("../features/transactions/pages/Transactions"));
const SalesReportDashboard = lazy(() => import("../features/reports/pages/SalesReportDashboard"));

/**
 * Admin portal route declarations
 * Includes Sales Reports, Plans & Services, Coupons, Cash Codes, and unified Transactions
 */
export const adminRoutes = [
  {
    path: "admin",
    element: <Navigate to="/admin/reports" replace />,
  },
  {
    path: "admin/reports",
    element: <SalesReportDashboard />,
  },
  {
    path: "admin/sales-report",
    element: <Navigate to="/admin/reports" replace />,
  },
  {
    path: "admin/plans",
    element: <PlansDashboard />,
  },
  {
    path: "admin/plans/new",
    element: <PlanForm />,
  },
  {
    path: "admin/plans/edit/:planId",
    element: <PlanForm />,
  },
  {
    path: "admin/plans/clone/:clonePlanId",
    element: <PlanForm />,
  },
  {
    path: "admin/coupons",
    element: <Coupons />,
  },
  {
    path: "admin/cash-codes",
    element: <CashCodes />,
  },
  {
    path: "admin/transactions",
    element: <Transactions />,
  },
  {
    path: "admin/purchases",
    element: <Transactions defaultTab="purchases" />,
  },
  {
    path: "admin/orders",
    element: <Transactions defaultTab="purchases" />,
  },
  {
    path: "admin/payments",
    element: <Transactions defaultTab="payments" />,
  },
];

export default adminRoutes;
