import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import AdminPlansDashboard from "./Pages/Admin/Plans/planDashboard/AdminPlansDashboard"
import PlanForm from "./Pages/Admin/Plans/planform/PlanForm"
import AdminRoute from "./Components/auth/AdminRoute"
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <div className="bg-background-secondary">
        <Router>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/service/:id" element={<ServiceDetails />} />
              <Route path="/checkout/success" element={<SuccessPage />} />
              <Route path="/checkout/failure" element={<FailurePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/plans/:purchaseId" element={<PurchasedPlanDetailsPage />} />
              
              {/* Secure Admin Routes with Server-Side Verification */}
              <Route element={<AdminRoute />}>
                <Route path="/admin/plans" element={<AdminPlansDashboard />} />
                <Route path="/admin/plans/new" element={<PlanForm />} />
                <Route path="/admin/plans/edit/:planId" element={<PlanForm />} />
              </Route>
              <Route path="/privacy-policy" element={<PolicyPage policyKey="privacy-policy" pdfUrl="/policies/Privacy_Policy_NeedMet_Digital.pdf" />} />
              <Route path="/terms-conditions" element={<PolicyPage policyKey="terms-conditions" pdfUrl="/policies/Terms_Conditions_NeedMet_Digital.pdf" />} />
              <Route path="/refund-policy" element={<PolicyPage policyKey="refund-policy" pdfUrl="/policies/Refund_Policy_NeedMet_Digital.pdf" />} />
            </Route>
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  )
}

export default App
