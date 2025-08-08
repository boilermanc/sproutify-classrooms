import React from "react";

export const GradientBackground: React.FC<{ className?: string }>=({ className })=>{
  return (
    <div className={"bg-aurora " + (className ?? "")} aria-hidden />
  );
};
