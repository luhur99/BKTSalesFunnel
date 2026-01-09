"use client";

import React from "react";
import { BarChart3 } from "lucide-react";

interface AnalyticsHeaderProps {
  title?: string;
  description?: string;
}

export function AnalyticsHeader({ 
  title = "Analytics & Performance Report",
  description = "Comprehensive insights into your sales funnel performance"
}: AnalyticsHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
        <BarChart3 className="w-8 h-8 text-white" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
}