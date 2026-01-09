"use client";

import React from "react";
import { HeatmapCell } from "@/types/analytics";
import { TrendingUp } from "lucide-react";

interface HeatmapGridProps {
  data: HeatmapCell[];
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function HeatmapGrid({ data }: HeatmapGridProps) {
  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "high": return "bg-red-500";
      case "medium": return "bg-orange-400";
      case "low": return "bg-yellow-300";
      default: return "bg-gray-100";
    }
  };

  const getCellData = (day: string, hour: number): HeatmapCell | undefined => {
    return data.find(cell => cell.day === day && cell.hour === hour);
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <TrendingUp className="w-12 h-12 mb-2 opacity-50" />
        <p>No heatmap data available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Hour labels */}
        <div className="flex mb-2">
          <div className="w-24 flex-shrink-0"></div>
          <div className="flex gap-1">
            {HOURS.map(hour => (
              <div key={hour} className="w-8 text-xs text-center text-gray-600">
                {hour}
              </div>
            ))}
          </div>
        </div>

        {/* Grid */}
        {DAYS.map(day => (
          <div key={day} className="flex mb-1">
            <div className="w-24 flex-shrink-0 text-sm font-medium text-gray-700 flex items-center">
              {day}
            </div>
            <div className="flex gap-1">
              {HOURS.map(hour => {
                const cellData = getCellData(day, hour);
                const intensity = cellData?.intensity || "none";
                const value = cellData?.value || 0;
                
                return (
                  <div
                    key={`${day}-${hour}`}
                    className={`w-8 h-8 rounded ${getIntensityColor(intensity)} transition-all hover:scale-110 cursor-pointer flex items-center justify-center`}
                    title={`${day} ${hour}:00 - ${value} leads`}
                  >
                    {value > 0 && (
                      <span className="text-xs font-semibold text-white">
                        {value}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 text-sm">
          <span className="text-gray-600">Intensity:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-100"></div>
            <span>None</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-300"></div>
            <span>Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-400"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span>High</span>
          </div>
        </div>
      </div>
    </div>
  );
}