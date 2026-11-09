import { lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './App.css'
import Layout from "./Components/layout/Layout"
import Home from "./Pages/Home/Home"
import ServiceDetails from './Pages/Pricing/ServiceDetails'
import SuccessPage from './Pages/Checkout/SuccessPage'
import FailurePage from './Pages/Checkout/FailurePage'
import Login from './Pages/Auth/Login'
import Signup from './Pages/Auth/Signup'
import PolicyPage from "./Pages/Policies/PolicyPage"
import ProfilePage from "./Pages/Profile/ProfilePage"
import PurchasedPlanDetailsPage from "./Pages/PlanDetailsPage/PurchasedPlanDetailsPage"
import AdminRoute from "./Components/auth/AdminRoute"
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./context/AuthContext";

// Admin Portal Shell & Lazy-loaded feature pages
import Admin from "./Admin/Admin";
const PlansDashboard = lazy(() => import("./Admin/features/plans/pages/PlansDashboard"));
const PlanForm = lazy(() => import("./Admin/features/plans/pages/PlanForm"));
const Coupons = lazy(() => import("./Admin/features/coupons/pages/Coupons"));
const CashCodes = lazy(() => import("./Admin/features/cashcodes/pages/CashCodes"));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="bg-background-secondary">
        <Router>
          <Routes>
            {/* Public Storefront Routes */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/service/:id" element={<ServiceDetails />} />
              <Route path="/checkout/success" element={<SuccessPage />} />
              <Route path="/checkout/failure" element={<FailurePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/plans/:purchaseId" element={<PurchasedPlanDetailsPage />} />
              <Route path="/privacy-policy" element={<PolicyPage policyKey="privacy-policy" pdfUrl="/policies/Privacy_Policy_NeedMet_Digital.pdf" />} />
              <Route path="/terms-conditions" element={<PolicyPage policyKey="terms-conditions" pdfUrl="/policies/Terms_Conditions_NeedMet_Digital.pdf" />} />
              <Route path="/refund-policy" element={<PolicyPage policyKey="refund-policy" pdfUrl="/policies/Refund_Policy_NeedMet_Digital.pdf" />} />
            </Route>

            {/* Secure Admin Portal Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Admin />}>
                <Route index element={<Navigate to="/admin/plans" replace />} />
                <Route path="plans" element={<PlansDashboard />} />
                <Route path="plans/new" element={<PlanForm />} />
                <Route path="plans/edit/:planId" element={<PlanForm />} />
                <Route path="plans/clone/:clonePlanId" element={<PlanForm />} />
                <Route path="coupons" element={<Coupons />} />
                <Route path="cash-codes" element={<CashCodes />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  </QueryClientProvider>
  )
}

export default App
