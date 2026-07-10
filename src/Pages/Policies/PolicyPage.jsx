import React from "react";
import { Link } from "react-router-dom";
import { policiesData } from "../../data/policiesData";

export default function PolicyPage({ policyKey, pdfUrl }) {
  const policy = policiesData[policyKey];

  if (!policy) {
    return (
      <div className="min-h-screen bg-background-secondary flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-text mb-4">Policy Not Found</h2>
        <Link to="/" className="text-primary font-semibold hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-secondary py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="">
          <h1 className="text-3xl font-extrabold text-text tracking-tight sm:text-4xl">
            {policy.title}
          </h1>
          <p className="mt-2 text-sm text-text-secondary font-medium">
            {policy.subtitle}
          </p>
        </div>

        {/* Policy Sections */}
        <div className="space-y-8">
          {policy.sections.map((section, idx) => (
            <section key={idx} className="group">
              <h2 className="text-xl font-bold text-text mb-3 group-hover:text-primary transition-colors duration-200 flex items-center gap-2">
                <span className="text-primary/40 font-mono text-sm">
                  {String(idx + 1).padStart(2, "0")}.
                </span>
                {section.title}
              </h2>
              <p className="text-text-secondary leading-relaxed text-[15px] pl-7">
                {section.content}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
