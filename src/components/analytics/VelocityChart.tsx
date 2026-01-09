"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Clock } from "lucide-react";
import { VelocityChartData } from "@/types/analytics";

interface VelocityChartProps {
  data: VelocityChartData[];
}

export function VelocityChart({ data }: VelocityChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Clock className="w-12 h-12 mb-2 opacity-50" />
        <p>No velocity data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="stage" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px'
            }}
            formatter={(value: number, name: string) => {
              if (name === 'hours') return [`${value.toFixed(2)} hours`, 'Avg Duration'];
              if (name === 'leads') return [`${value} leads`, 'Total Passed'];
              return [value, name];
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => {
              if (value === 'hours') return 'Average Hours';
              if (value === 'leads') return 'Total Leads';
              return value;
            }}
          />
          <Bar 
            dataKey="hours" 
            fill="#3b82f6" 
            radius={[8, 8, 0, 0]}
            name="hours"
          />
          <Bar 
            dataKey="leads" 
            fill="#10b981" 
            radius={[8, 8, 0, 0]}
            name="leads"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}