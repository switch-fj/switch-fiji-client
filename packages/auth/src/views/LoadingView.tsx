"use client";

import { Card, CardHeader, CardTitle } from "@switch-fiji/ui";

export default function LoadingView() {
  return (
    <div className="w-full max-w-lg border-none bg-white px-10 py-12 ">
      <p className="text-text-1 text-center text-sm font-normal">
        Checking your credentials, please wait a moment...
      </p>
      <div className="flex items-center justify-center py-10">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border/60 border-t-primary" />
      </div>
    </div>
  );
}
