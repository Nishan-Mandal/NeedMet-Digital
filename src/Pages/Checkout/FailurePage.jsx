import { useSearchParams, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function FailurePage() {
  const [searchParams] = useSearchParams();
  const errorMessage = searchParams.get("error") || "An unexpected error occurred during payment.";
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Detect auth-related failures
  const isAuthError = !currentUser ||
    errorMessage.toLowerCase().includes("login") ||
    errorMessage.toLowerCase().includes("unauthenticated") ||
    errorMessage.toLowerCase().includes("auth");

  const handleGoToDashboard = () => {
    window.location.href = import.meta.env.VITE_DASHBOARD_URL || "https://needmet.in/dashboard";
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl text-center">
        
        <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full ${isAuthError ? "bg-amber-100" : "bg-red-100"}`}>
          <span className={`material-symbols-outlined text-5xl ${isAuthError ? "text-amber-600" : "text-red-600"}`}>
            {isAuthError ? "lock" : "error"}
          </span>
        </div>
        
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          {isAuthError ? "Login Required" : "Payment Failed"}
        </h2>
        
        <p className="mt-2 text-sm text-gray-600">
          {isAuthError
            ? "You need to be logged in to complete this payment."
            : "Unfortunately, your payment could not be processed."}
        </p>

        <div className="mt-4 rounded-lg bg-gray-50 p-4 border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Reason</p>
          <p className="mt-1 text-sm text-gray-900">{errorMessage}</p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {isAuthError ? (
            <>
              <button
                onClick={() => navigate("/login", { state: { from: "/" } })}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus:outline-none"
              >
                <span className="material-symbols-outlined text-base">login</span>
                Login to Continue
              </button>
              <button
                onClick={() => navigate("/")}
                className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 focus:outline-none"
              >
                Go to Home
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate(-1)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus:outline-none"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
                Try Again
              </button>
              {/* <button
                onClick={handleGoToDashboard}
                className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 focus:outline-none"
              >
                Go to My Dashboard
              </button> */}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
