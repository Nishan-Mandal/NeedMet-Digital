import { useState } from "react";
import { createPortal } from "react-dom";

export default function ReviewCard({ name, role, image, review, bgColor }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <>
            <div className="rounded-3xl border border-border/30 bg-white p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl h-[230px] flex flex-col justify-between">
                <div>
                    <div className="mb-5 flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className={"h-12 w-12 overflow-hidden rounded-full shrink-0 bg-green-800"}>
                               <div className="h-full w-full flex items-center justify-center text-xl font-bold text-white">
                                        {name?.charAt(0).toUpperCase()}
                                    </div>
                            </div>
                            <div>
                                <h4 className="font-bold line-clamp-1">{name}</h4>
                                <p className="text-sm text-text-secondary line-clamp-1">{role}</p>
                            </div>
                        </div>
                        <div className="flex text-primary shrink-0">
                            {[...Array(5)].map((_, i) => (
                                <span
                                    key={i}
                                    className="material-symbols-outlined text-[20px]"
                                    style={{ fontVariationSettings: "'FILL' 1" }}
                                >
                                    star
                                </span>
                            ))}
                        </div>
                    </div>

                    <p className="italic text-text line-clamp-4">
                        {review}
                    </p>
                </div>

                <button
                    onClick={() => setIsExpanded(true)}
                    className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-light transition-colors self-start"
                >
                    Expand review
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </button>
            </div>

            {isExpanded &&
                createPortal(
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
                        onClick={() => setIsExpanded(false)}
                    >
                        <div
                            className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900"
                            >
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>

                            <div className="mb-6 flex items-center gap-4 pr-8">
                                <div className={`h-14 w-14 overflow-hidden rounded-full shrink-0 ${bgColor || "bg-gray-200"}`}>
                                    {image ? (
                                        <img
                                            src={image}
                                            alt={name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-white">
                                            {name?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold">{name}</h4>
                                    <p className="text-text-secondary">{role}</p>
                                </div>
                            </div>
                            
                            <div className="mb-6 flex text-primary">
                                {[...Array(5)].map((_, i) => (
                                    <span
                                        key={i}
                                        className="material-symbols-outlined text-[24px]"
                                        style={{ fontVariationSettings: "'FILL' 1" }}
                                    >
                                        star
                                    </span>
                                ))}
                            </div>

                            <p className="text-lg italic text-text leading-relaxed">
                                "{review}"
                            </p>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}