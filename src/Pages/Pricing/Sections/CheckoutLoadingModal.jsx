export default function CheckoutLoadingModal({
  isOpen,
  stepFeedback,
  paymentMethod,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-7 shadow-2xl space-y-4 max-w-sm w-full mx-auto border border-gray-100 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="relative flex items-center justify-center">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-emerald-600/20 border-t-emerald-600"></div>
          <span className="material-symbols-outlined absolute text-emerald-700 text-xl">
            {paymentMethod === "EMI" ? "lock_clock" : "lock"}
          </span>
        </div>

        <div className="space-y-1">
          {paymentMethod === "EMI" && stepFeedback?.step && (
            <span className="inline-block rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800">
              {stepFeedback.step}
            </span>
          )}
          <p className="text-lg font-bold text-gray-900">{stepFeedback?.title || "Processing..."}</p>
          <p className="text-xs text-gray-500 max-w-xs">{stepFeedback?.desc || "Please wait..."}</p>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
          <div className="bg-emerald-600 h-full w-2/3 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
