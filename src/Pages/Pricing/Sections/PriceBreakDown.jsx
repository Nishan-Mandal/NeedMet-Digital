import { formatCurrency } from "../../../utils/Formatters";



export default function PriceBreakdown({ plan, pricing }) {


  return (
    <div className="space-y-2">

      <div className="flex justify-between">
        <span>Plan</span>
        <span>{plan.name}</span>
      </div>

      <div className="flex justify-between">
        <span>Plan for</span>
        <span>{plan.duration}</span>
      </div>

      {/* <div className="flex justify-between">
        <span>Monthly</span>
        <span>{formatCurrency(pricing.baseprice)}</span>
      </div> */}

      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>{formatCurrency(pricing.total)}</span>
      </div>

      {/* <div className="flex justify-between">
        <span>You Saved</span>
        <span>-{formatCurrency(plan.discount)}</span>
      </div> */}


      {pricing.couponDiscount > 0 && (
        <div className="flex justify-between text-primary">
          <span>Coupon</span>
          <span>-{formatCurrency(pricing.couponDiscount)}</span>
        </div>
      )}

      <div className="border-t pt-4">
        <div className="flex justify-between">
          <span className="text-xl font-bold">Total</span>
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(pricing.grand)}
          </span>
        </div>
      </div>

    </div>
  );
}