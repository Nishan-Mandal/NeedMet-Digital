import { formatCurrency } from "../../../utils/Formatters";

export default function CheckoutButton({ onClick, isLoading, isEmi, upfrontAmount, upfrontDisplay }) {
  let buttonLabel = "Proceed to Payment";
  if (isLoading) {
    buttonLabel = "Processing...";
  } else if (isEmi && upfrontAmount) {
    buttonLabel = `Pay ${formatCurrency(upfrontAmount)} (${upfrontDisplay ? `${upfrontDisplay} ` : ""}Down Payment)`;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={`
        w-full
        rounded-xl
        bg-gradient-to-r
        from-primary
        to-primary-light
        py-4
        px-4
        font-semibold
        text-white
        shadow-md
        transition-all
        duration-200
        flex
        items-center
        justify-center
        gap-2
        ${isLoading ? "opacity-75 cursor-not-allowed" : "hover:scale-[1.01] hover:shadow-lg active:scale-[0.99]"}
      `}
    >
      <span className="material-symbols-outlined text-xl">
        {isEmi ? "lock_clock" : "lock"}
      </span>
      <span>{buttonLabel}</span>
    </button>
  );
}

