import { formatCurrency } from "../../../utils/Formatters";

export default function PlanCard({
  title,
  plan,
  basePrice,
  selected,
  onSelect
}) {
  return (
    <div
      onClick={() => onSelect(title)}
      className={`relative cursor-pointer rounded-[24px] border-2 bg-white py-4 px-6 sm:p-6 transition-all duration-300 ${
        selected
          ? "border-primary ring-2 ring-primary/20"
          : "border-border/30 hover:border-primary/40"
      }`}
    >
      {plan.tag && (
        <div className="absolute right-0 top-0 rounded-bl-xl rounded-tr-2xl bg-primary px-4 py-1 text-xs font-medium text-white">
          {plan.tag}
        </div>
      )}

      <h3 className="text-[21px] sm:text-[25px] lg:text-[25px] font-bold">{title}</h3>

      <div className="mt-3 flex items-end gap-1">
        <span className="text-3xl font-bold text-primary">
          ₹{basePrice ? basePrice.toLocaleString() : 0}
        </span>
        <span className="pb-1 text-sm text-text-secondary">
          / {plan.duration || "total"}
        </span>
      </div>

      {plan.discount > 0 && (
        <p className="mt-2 text-sm font-semibold text-text-secondary">
          Save {formatCurrency(plan.discount)}
        </p>
      )}

      <p className="mt-5 text-sm text-text-secondary">{plan.description}</p>
    </div>
  );
}