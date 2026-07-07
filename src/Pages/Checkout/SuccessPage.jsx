import { useSearchParams, useNavigate } from "react-router-dom";

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
          <span className="material-symbols-outlined text-5xl text-green-600">
            check_circle
          </span>
        </div>
        
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Payment Successful!
        </h2>
        
        <p className="mt-2 text-sm text-gray-600">
          Thank you for your purchase. Your subscription has been created.
        </p>

        {orderId && (
          <div className="mt-4 rounded-lg bg-gray-50 p-4 border border-gray-100">
            <p className="text-sm font-medium text-gray-500">Order Reference</p>
            <p className="mt-1 font-mono text-lg text-gray-900">{orderId}</p>
          </div>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus:outline-none"
          >
            Explore More Plans
          </button>
          {/* <button
            onClick={() => window.location.href = import.meta.env.VITE_DASHBOARD_URL || "https://needmet.in/dashboard"}
            className="inline-flex w-full items-center justify-center rounded-xl border border-primary px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/5 focus:outline-none"
          >
            Go to My Dashboard
          </button> */}
        </div>
      </div>
    </div>
  );
}
