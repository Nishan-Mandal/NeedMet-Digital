import { formatNumber } from "../../../utils/Formatters";

export default function RatingBar({
  rating,
  reviews,
  clients = 0,
  verified = true
}) {
  return (
    <div className="flex flex-wrap items-center gap-5 mt-1">
      <div className="flex items-center justify-between sm:gap-5  w-full sm:w-auto">
        <div className="sm:flex justify-center items-center gap-2 pl-[10px]  ">
        <div className="flex items-center gap- px-3">
            <span
            className="material-symbols-outlined text-primary  "
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
          <p className="text-2xl font-bold text-primary  ">{rating}</p>
        </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium ">({reviews} Reviews)</span>
          </div>
        </div>

        <div className="h-1 w-1 rounded-full bg-gray-400 hidden sm:block" />

        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
          <span className="material-symbols-outlined text-primary icon-3xl">groups</span>
          <span className="text-sm sm:text-[16px] font-medium">{formatNumber(clients)}+ Served</span>
        </div>


        {verified && (
          <div className="flex flex-col sm:flex-row items-center  gap-2">
            <div className="h-1 w-1 rounded-full bg-gray-400 hidden sm:block" />
            <div className="flex flex-col sm:flex-row items-center  gap-2">
              <span className="material-symbols-outlined text-primary">verified</span>
              <span className="text-sm sm:text-[16px] font-medium">Pro Verified</span>
            </div>
          </div>
        )}</div>
    </div>
  );
}