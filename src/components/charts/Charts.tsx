import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const NAVY = '#1f3366';
const GOLD = '#e0ab38';
const SKY = '#38bdf8';
const EMERALD = '#10b981';
const ROSE = '#f43f5e';
const AMBER = '#f59e0b';
const VIOLET = '#8b5cf6';
const SLATE = '#94a3b8';

export const PIE_COLORS = [NAVY, GOLD, SKY, EMERALD, ROSE, AMBER, VIOLET, SLATE];

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #ecedf5',
  boxShadow: '0 8px 24px -8px rgba(15,23,55,0.15)',
  fontSize: 12,
  fontFamily: 'Manrope, sans-serif',
};

export function CollectionAreaChart({ data }: { data: { month: string; collected: number; due: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ left: -20, right: 10, top: 10 }}>
        <defs>
          <linearGradient id="collectedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={NAVY} stopOpacity={0.35} />
            <stop offset="95%" stopColor={NAVY} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="dueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={GOLD} stopOpacity={0.35} />
            <stop offset="95%" stopColor={GOLD} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f6" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, '']} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" dataKey="due" name="Target" stroke={GOLD} fill="url(#dueGrad)" strokeWidth={2} />
        <Area type="monotone" dataKey="collected" name="Collected" stroke={NAVY} fill="url(#collectedGrad)" strokeWidth={2.5} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function OccupancyBarChart({ data }: { data: { name: string; occupied: number; available: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: -20, right: 10, top: 10 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f6" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="occupied" name="Occupied" stackId="a" fill={NAVY} radius={[0, 0, 0, 0]} />
        <Bar dataKey="available" name="Available" stackId="a" fill={GOLD} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DonutChart({ data, height = 240 }: { data: { name: string; value: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function AdmissionsLineChart({ data }: { data: { month: string; applications: number; approved: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ left: -20, right: 10, top: 10 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f6" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="applications" name="Applications" stroke={SKY} strokeWidth={2.5} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="approved" name="Approved" stroke={EMERALD} strokeWidth={2.5} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function MealTrendChart({ data }: { data: { day: string; breakfast: number; lunch: number; dinner: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ left: -20, right: 10, top: 10 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f6" />
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="breakfast" stroke={AMBER} strokeWidth={2} dot={{ r: 2.5 }} />
        <Line type="monotone" dataKey="lunch" stroke={NAVY} strokeWidth={2} dot={{ r: 2.5 }} />
        <Line type="monotone" dataKey="dinner" stroke={VIOLET} strokeWidth={2} dot={{ r: 2.5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
