import PlanCard from "./PlanCard";

export default function PlanSelector({
  plans,
  selectedPlanId,
  onSelect,
  basePrice,
}) {
  return (
    <section className="py-2">
     
        <div className="space-y-8">
          <h2 className="text-[21px] sm:text-[25px] lg:text-[25px] font-bold flex items-center gap-2 text-[#0F5C3E]">
            <span className="material-symbols-outlined">
energy_program_saving
</span>
            Select Duration
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                title={plan.name}
                plan={plan}
                basePrice={plan.price}
                selected={selectedPlanId === plan.id}
                onSelect={() => onSelect(plan.id)}
              />
            ))}
          </div>
        </div>
      
    </section>
  );
}