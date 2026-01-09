"use client";

import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { BottleneckWarning } from "@/types/analytics";

interface BottleneckWarningsProps {
  warnings: BottleneckWarning[];
}

export function BottleneckWarnings({ warnings }: BottleneckWarningsProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high": return <AlertTriangle className="h-5 w-5" />;
      case "medium": return <AlertCircle className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "border-red-500 bg-red-50 text-red-900";
      case "medium": return "border-orange-500 bg-orange-50 text-orange-900";
      default: return "border-yellow-500 bg-yellow-50 text-yellow-900";
    }
  };

  if (!warnings || warnings.length === 0) {
    return (
      <Alert className="border-green-500 bg-green-50">
        <Info className="h-5 w-5 text-green-600" />
        <AlertTitle className="text-green-900">No Bottlenecks Detected</AlertTitle>
        <AlertDescription className="text-green-700">
          All stages are performing within acceptable parameters. Keep up the good work!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {warnings.map((warning, index) => (
        <Alert key={index} className={getSeverityColor(warning.severity)}>
          {getSeverityIcon(warning.severity)}
          <AlertTitle className="font-semibold">
            {warning.stage_name} - {warning.severity.toUpperCase()} Priority
          </AlertTitle>
          <AlertDescription>
            <p className="mb-2">{warning.message}</p>
            <div className="flex gap-4 text-sm">
              <span>Average Duration: <strong>{warning.avg_hours.toFixed(2)} hours</strong></span>
              <span>Total Leads: <strong>{warning.total_leads}</strong></span>
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}