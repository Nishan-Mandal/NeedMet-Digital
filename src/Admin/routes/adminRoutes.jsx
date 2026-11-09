import { lazy } from "react";
import { Navigate } from "react-router-dom";

const PlansDashboard = lazy(() => import("../features/plans/pages/PlansDashboard"));
const PlanForm = lazy(() => import("../features/plans/pages/PlanForm"));
const Coupons = lazy(() => import("../features/coupons/pages/Coupons"));
const CashCodes = lazy(() => import("../features/cashcodes/pages/CashCodes"));

/**
 * Admin portal route declarations
 * Only includes Plans & Services, Coupons, and Cash Codes
 */
export const adminRoutes = [
  {
    path: "admin",
    element: <Navigate to="/admin/plans" replace />,
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
];

export default adminRoutes;

