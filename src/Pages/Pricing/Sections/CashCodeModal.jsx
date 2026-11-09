import React, { useState } from "react";
import { verifyCashPaymentService } from "../../../services/payment.service";
import { useNavigate } from "react-router-dom";
import { buildSuccessQueryParams } from "../utils";

export default function CashCodeModal({ isOpen, onClose, serviceId, planId, couponCode, serviceDetails }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const result = await verifyCashPaymentService(serviceId, planId, couponCode, code.trim());
      onClose();

      const metadata = {
        paymentType: "CASH",
        purchaseId: result?.purchaseId || "",
        serviceId: serviceId || "",
        planId: planId || "",
        serviceName: serviceDetails?.serviceName || "",
        planName: serviceDetails?.planName || "",
        amount: serviceDetails?.finalPrice ?? serviceDetails?.upfrontAmount,
        totalAmount: serviceDetails?.finalPrice ?? serviceDetails?.basePrice,
      };

      navigate(`/checkout/success?${buildSuccessQueryParams(metadata)}`);
    } catch (err) {
      setError(err.message || "Failed to verify cash code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Cash Code</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Please enter the cash code provided to you to complete your payment.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cash Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. CASH-H6BR74"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center rounded-xl bg-primary px-4 py-3 font-medium text-white hover:bg-primary-dark transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading || !code.trim()}
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                "Verify Code"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
