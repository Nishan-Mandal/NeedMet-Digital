import { lazy } from "react";
import { Navigate } from "react-router-dom";

const PlansDashboard = lazy(() => import("../features/plans/pages/PlansDashboard"));
const PlanForm = lazy(() => import("../features/plans/pages/PlanForm"));
const Coupons = lazy(() => import("../features/coupons/pages/Coupons"));
const CashCodes = lazy(() => import("../features/cashcodes/pages/CashCodes"));
const Purchases = lazy(() => import("../features/purchases/pages/Purchases"));
const Payments = lazy(() => import("../features/payments/pages/Payments"));
const SalesReportDashboard = lazy(() => import("../features/reports/pages/SalesReportDashboard"));

/**
 * Admin portal route declarations
 * Includes Sales Reports, Plans & Services, Coupons, Cash Codes, Purchases, and Payments
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
    path: "admin/purchases",
    element: <Purchases />,
  },
  {
    path: "admin/orders",
    element: <Navigate to="/admin/purchases" replace />,
  },
  {
    path: "admin/payments",
    element: <Payments />,
  },
  {
    path: "admin/transactions",
    element: <Navigate to="/admin/payments" replace />,
  },
];

export default adminRoutes;

