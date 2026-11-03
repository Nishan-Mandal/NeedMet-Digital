import React, { useState, useEffect } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { httpsCallable } from "firebase/functions";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db, functions } from "../../config/firebase";
import useAuth from "../../hooks/useAuth";

const AdminRoute = () => {
  const { currentUser, authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [verifying, setVerifying] = useState(true);
  const [isServerAdmin, setIsServerAdmin] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let isMounted = true;

    const verifyAdminStatus = async () => {
      if (!currentUser) {
        if (isMounted) {
          setIsServerAdmin(false);
          setVerifying(false);
        }
        return;
      }

      setVerifying(true);
      setErrorMsg("");

      try {
        // 1. Primary: Authoritative Server-Side Cloud Function Verification
        const verifyAdminCallable = httpsCallable(functions, "verifyAdmin");
        const result = await verifyAdminCallable();

        if (result?.data?.isAdmin && isMounted) {
          setIsServerAdmin(true);
          setVerifying(false);
          return;
        }
      } catch (cloudFnErr) {
        console.warn("Cloud function verifyAdmin call error, falling back to secure token check:", cloudFnErr.message);

        // 2. Authoritative Fallback: Force refresh token directly against Firebase Auth backend
        try {
          const freshToken = await currentUser.getIdTokenResult(true);
          const hasAdminClaim = freshToken?.claims?.role === "admin" || freshToken?.claims?.admin === true;

          if (hasAdminClaim && isMounted) {
            setIsServerAdmin(true);
            setVerifying(false);
            return;
          }

          // 3. Fallback: Check Firestore users/{uid} server document directly
          const userSnap = await getDoc(doc(db, "users", currentUser.uid));
          if (userSnap.exists() && isMounted) {
            const userData = userSnap.data();
            const isAdminRole = userData.role === "admin" || userData.isAdmin === true;
            if (isAdminRole) {
              setIsServerAdmin(true);
              setVerifying(false);
              return;
            }
          }
        } catch (tokenErr) {
          console.error("Server token verification error:", tokenErr);
        }

        if (isMounted) {
          setIsServerAdmin(false);
          setErrorMsg(cloudFnErr.message || "Administrator clearance required.");
          setVerifying(false);
        }
      }
    };

    if (!authLoading) {
      verifyAdminStatus();
    }

    return () => {
      isMounted = false;
    };
  }, [currentUser, authLoading]);

  // Loading states
  if (authLoading || verifying) {
    return (
      <div className="min-h-[calc(100dvh-4rem)] sm:min-h-[calc(100vh-4rem)] w-full flex flex-col items-center justify-center p-6 text-center">
        <div className="relative w-14 h-14 mb-4">
          <div className="w-14 h-14 border-4 border-[#266C51]/20 border-t-[#266C51] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-6 h-6 text-[#266C51]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-bold text-text-primary">Verifying Administrator Clearance</h2>
        <p className="text-sm text-text-secondary mt-1.5 max-w-sm">
          Authenticating secure server-side credentials and permissions...
        </p>
      </div>
    );
  }

  // Not logged in -> Redirect to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but not an admin -> 403 Access Denied
  if (!isServerAdmin) {
    return (
      <div className="min-h-[calc(100dvh-4rem)] sm:min-h-[calc(100vh-4rem)] w-full flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-red-100 shadow-xl text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
            <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold uppercase tracking-wider rounded-full mb-3">
            403 • Access Forbidden
          </span>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Admin Clearance Required</h1>
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">
            Your signed-in account (<strong className="text-gray-900">{currentUser.email}</strong>) does not have administrative privileges to access Plan Management.
          </p>

          {errorMsg && (
            <div className="mt-4 p-2.5 bg-red-50/70 border border-red-100 rounded-xl text-xs text-red-600 font-mono">
              {errorMsg}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 px-4 bg-[#266C51] hover:bg-[#1f5641] text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-[#266C51]/20"
            >
              Return to Homepage
            </button>
            <button
              onClick={async () => {
                await signOut(auth);
                navigate("/login", { state: { from: location } });
              }}
              className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-all"
            >
              Sign In with Another Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authorized -> Render protected admin routes
  return <Outlet />;
};

export default AdminRoute;
