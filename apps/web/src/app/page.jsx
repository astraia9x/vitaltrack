"use client";

import React, { useState, useMemo } from "react";
import {
  Activity,
  Calendar,
  ClipboardList,
  Stethoscope,
  Cloud,
  Plus,
  CheckCircle2,
  AlertCircle,
  Thermometer,
  MoreHorizontal,
  AlertTriangle,
  Droplets,
  Wind,
  MapPin,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, href }) => (
  <a
    href={href}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-sm text-sm transition-colors ${
      active
        ? "bg-blue-50 text-blue-600 font-medium"
        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
    }`}
  >
    <Icon size={18} />
    {label}
  </a>
);

const Pill = ({ children, type = "outline", dotColor }) => {
  if (type === "soft") {
    return (
      <span className="bg-blue-50 text-blue-600 rounded-full px-3 py-1.5 text-sm font-medium inline-flex items-center gap-1.5">
        {children}
      </span>
    );
  }
  return (
    <span className="bg-white border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-700 inline-flex items-center gap-1.5">
      {dotColor && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {children}
    </span>
  );
};

const Card = ({ title, description, children, action }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
    <div className="flex justify-between items-start">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-gray-900 leading-tight">
          {title}
        </h3>
        {description && <p className="text-gray-500 text-sm">{description}</p>}
      </div>
      {action}
    </div>
    {children}
  </div>
);

// Horizontal stat bar — replaces the circular DataRing
const StatBar = ({
  value,
  max = 100,
  label,
  color = "#3B82F6",
  unit = "%",
}) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        <span className="text-xs font-semibold text-gray-800">
          {value}
          {unit}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

// AQI label helper
const aqiLabel = (index) => {
  if (index <= 1) return { text: "Good", color: "#22C55E" };
  if (index <= 2) return { text: "Moderate", color: "#EAB308" };
  if (index <= 3) return { text: "Unhealthy for Sensitive", color: "#F97316" };
  if (index <= 4) return { text: "Unhealthy", color: "#EF4444" };
  if (index <= 5) return { text: "Very Unhealthy", color: "#A855F7" };
  return { text: "Hazardous", color: "#7F1D1D" };
};

// --- Main Page ---

export default function HealthDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [city, setCity] = useState("San Francisco");
  const [cityInput, setCityInput] = useState("San Francisco");
  const queryClient = useQueryClient();

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => fetch("/api/appointments").then((res) => res.json()),
  });

  const { data: routines = [] } = useQuery({
    queryKey: ["routines"],
    queryFn: () => fetch("/api/routines").then((res) => res.json()),
  });

  const { data: symptoms = [] } = useQuery({
    queryKey: ["symptoms"],
    queryFn: () => fetch("/api/symptoms").then((res) => res.json()),
  });

  const { data: records = [] } = useQuery({
    queryKey: ["records"],
    queryFn: () => fetch("/api/records").then((res) => res.json()),
  });

  const {
    data: weather,
    isLoading: weatherLoading,
    isError: weatherError,
  } = useQuery({
    queryKey: ["weather", city],
    queryFn: () =>
      fetch(`/api/weather?city=${encodeURIComponent(city)}`).then((res) => {
        if (!res.ok) throw new Error("Weather fetch failed");
        return res.json();
      }),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const upcomingAppointment = useMemo(
    () => appointments.find((a) => a.status === "Scheduled"),
    [appointments],
  );

  const activeRoutines = useMemo(
    () => routines.filter((r) => r.is_active),
    [routines],
  );

  // Computed summary stats from real data
  const routineCompletionPct = useMemo(() => {
    if (!routines.length) return 0;
    return Math.round((activeRoutines.length / routines.length) * 100);
  }, [routines, activeRoutines]);

  const recentAvgSeverity = useMemo(() => {
    const recent = symptoms.slice(0, 7);
    if (!recent.length) return 0;
    const avg =
      recent.reduce((sum, s) => sum + (s.severity || 0), 0) / recent.length;
    return Math.round(avg * 10) / 10;
  }, [symptoms]);

  // Forecast-based alert logic
  const weatherAlerts = useMemo(() => {
    if (!weather?.current || !symptoms.length) return [];
    const alerts = [];
    const symptomsWithWeather = symptoms.filter(
      (s) => s.weather_condition && s.weather_temp != null,
    );
    if (!symptomsWithWeather.length) return [];

    const currentCondition = (
      weather.current.condition?.text || ""
    ).toLowerCase();
    const currentTempC = weather.current.temp_c;
    const currentKeywords = currentCondition
      .split(/\s+/)
      .filter((w) => w.length > 3);

    const conditionGroups = {};
    symptomsWithWeather.forEach((s) => {
      const words = s.weather_condition.toLowerCase().split(/\s+/);
      const matchingKeyword = words.find((w) =>
        currentKeywords.some((ck) => ck.includes(w) || w.includes(ck)),
      );
      if (matchingKeyword) {
        if (!conditionGroups[matchingKeyword])
          conditionGroups[matchingKeyword] = [];
        conditionGroups[matchingKeyword].push(s.severity);
      }
    });

    Object.entries(conditionGroups).forEach(([keyword, severities]) => {
      const avg = severities.reduce((a, b) => a + b, 0) / severities.length;
      if (avg >= 6) {
        alerts.push({
          id: `condition-${keyword}`,
          level: avg >= 8 ? "high" : "medium",
          message: `${weather.current.condition.text} conditions have previously triggered symptoms (avg severity ${avg.toFixed(1)}/10 across ${severities.length} log${severities.length > 1 ? "s" : ""}).`,
        });
      }
    });

    if (currentTempC != null) {
      const tempMatches = symptomsWithWeather.filter(
        (s) => Math.abs(Number(s.weather_temp) - currentTempC) <= 5,
      );
      if (tempMatches.length >= 2) {
        const avg =
          tempMatches.reduce((a, b) => a + b.severity, 0) / tempMatches.length;
        if (avg >= 6) {
          alerts.push({
            id: "temperature",
            level: avg >= 8 ? "high" : "medium",
            message: `Temperatures near ${Math.round(currentTempC)}°C have been associated with higher-severity symptoms (avg ${avg.toFixed(1)}/10 across ${tempMatches.length} log${tempMatches.length > 1 ? "s" : ""}).`,
          });
        }
      }
    }

    return alerts;
  }, [weather, symptoms]);

  const handleCitySubmit = () => {
    if (cityInput.trim()) setCity(cityInput.trim());
  };

  const weatherDescription = weather?.location?.name
    ? `${weather.location.name}, ${weather.location.region}`
    : city;

  // AQI from response (available if API returns air_quality object)
  const aqiIndex = weather?.current?.air_quality?.["us-epa-index"];
  const aqiInfo = aqiIndex != null ? aqiLabel(aqiIndex) : null;

  // Pre-computed severity bar color to avoid complex JSX expressions
  const severityBarColor =
    recentAvgSeverity >= 7
      ? "#EF4444"
      : recentAvgSeverity >= 4
        ? "#F97316"
        : "#22C55E";

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex font-inter">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white p-4 hidden md:flex flex-col gap-8">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <Stethoscope size={20} />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            VitalTrack
          </span>
        </div>
        <nav className="flex flex-col gap-1">
          <SidebarItem
            icon={Activity}
            label="Dashboard"
            active={activeTab === "dashboard"}
            href="/"
          />
          <SidebarItem
            icon={ClipboardList}
            label="Health Records"
            href="/records"
          />
          <SidebarItem icon={Calendar} label="Routines" href="/routines" />
          <SidebarItem
            icon={Stethoscope}
            label="Appointments"
            href="/appointments"
          />
          <SidebarItem icon={Cloud} label="Symptom Log" href="/symptoms" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <Pill type="outline">{city}</Pill>
            <a
              href="/symptoms"
              className="bg-blue-600 text-white rounded-sm px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus size={16} />
              New Log
            </a>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
          {/* Weather Alert Banners */}
          {weatherAlerts.length > 0 && (
            <div className="flex flex-col gap-3">
              {weatherAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border ${
                    alert.level === "high"
                      ? "bg-red-50 border-red-200 text-red-800"
                      : "bg-amber-50 border-amber-200 text-amber-800"
                  }`}
                >
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-sm">
                      {alert.level === "high" ? "High Risk" : "Weather Alert"}
                    </span>
                    <p className="text-sm mt-0.5 opacity-90">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quick Summary — horizontal bars */}
            <Card
              title="Quick Summary"
              description="Overview of your health status"
            >
              <div className="flex flex-col gap-5 py-1">
                <StatBar
                  value={routineCompletionPct}
                  max={100}
                  label="Routine Completion"
                  color="#3B82F6"
                  unit="%"
                />
                <StatBar
                  value={recentAvgSeverity}
                  max={10}
                  label="Avg Symptom Severity (last 7)"
                  color={severityBarColor}
                  unit="/10"
                />
                <StatBar
                  value={records.length}
                  max={Math.max(records.length, 10)}
                  label="Health Records Stored"
                  color="#8B5CF6"
                  unit=" records"
                />
              </div>
            </Card>

            {/* Next Appointment */}
            <Card
              title="Next Appointment"
              description="Upcoming visit with specialist"
              action={
                <a href="/appointments">
                  <Pill type="soft">View All</Pill>
                </a>
              }
            >
              {upcomingAppointment ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 font-semibold">
                      {upcomingAppointment.doctor_name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">
                        Dr. {upcomingAppointment.doctor_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {upcomingAppointment.specialty}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar size={14} />
                    {new Date(
                      upcomingAppointment.appointment_date,
                    ).toLocaleDateString()}{" "}
                    at{" "}
                    {new Date(
                      upcomingAppointment.appointment_date,
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-gray-400">
                  <Calendar size={24} className="mb-2 opacity-20" />
                  <span className="text-xs">No upcoming appointments</span>
                </div>
              )}
            </Card>

            {/* Live Weather — metric */}
            <Card title="Live Weather" description={weatherDescription}>
              {weatherLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div
                    style={{
                      animation: "weatherPulse 1.5s ease-in-out infinite",
                    }}
                    className="text-xs text-gray-400"
                  >
                    Fetching weather…
                  </div>
                </div>
              ) : weatherError || weather?.error ? (
                <div className="flex items-center gap-2 text-xs text-red-500 py-2">
                  <AlertCircle size={14} />
                  Couldn't load weather. Check the city name.
                </div>
              ) : weather?.current ? (
                <div className="flex flex-col gap-3">
                  {/* Temp + condition */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {weather.current.condition?.icon ? (
                        <img
                          src={`https:${weather.current.condition.icon}`}
                          alt={weather.current.condition.text}
                          className="w-12 h-12"
                        />
                      ) : (
                        <Cloud className="text-blue-500" size={32} />
                      )}
                      <div className="flex flex-col">
                        <span className="text-3xl font-semibold text-gray-900">
                          {Math.round(weather.current.temp_c)}°C
                        </span>
                        <span className="text-sm text-gray-500">
                          {weather.current.condition?.text}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col gap-1">
                      <div className="flex items-center justify-end gap-1 text-xs text-gray-500">
                        <Droplets size={11} />
                        {weather.current.humidity}% humidity
                      </div>
                      <div className="flex items-center justify-end gap-1 text-xs text-gray-500">
                        <Wind size={11} />
                        {weather.current.wind_kph} km/h
                      </div>
                      <div className="text-xs text-gray-500">
                        Feels {Math.round(weather.current.feelslike_c)}°C
                      </div>
                      <div className="text-xs text-gray-500">
                        UV: {weather.current.uv}
                      </div>
                    </div>
                  </div>

                  {/* AQI row — only shown if API returns air quality data */}
                  {aqiInfo && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
                      <span className="text-xs text-gray-500 font-medium">
                        Air Quality
                      </span>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: aqiInfo.color + "22",
                          color: aqiInfo.color,
                        }}
                      >
                        {aqiInfo.text}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">
                        US EPA Index {aqiIndex}
                      </span>
                    </div>
                  )}

                  {/* City input */}
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin size={12} className="text-gray-400 shrink-0" />
                    <input
                      type="text"
                      value={cityInput}
                      onChange={(e) => setCityInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCitySubmit()}
                      onBlur={handleCitySubmit}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 outline-none focus:border-blue-400 transition-colors"
                      placeholder="Change city…"
                    />
                  </div>
                </div>
              ) : null}
            </Card>
          </div>

          {/* Lists Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card
              title="Active Routines"
              description="Daily health habits and medications"
            >
              <div className="flex flex-col gap-3">
                {activeRoutines.map((routine) => (
                  <div
                    key={routine.id}
                    className="flex items-center justify-between p-3 border border-gray-100 rounded-md hover:border-gray-200 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <CheckCircle2 size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {routine.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {routine.time_of_day} • {routine.frequency}
                        </span>
                      </div>
                    </div>
                    <button className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                ))}
                {activeRoutines.length === 0 && (
                  <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-md">
                    <p className="text-xs text-gray-400">
                      No active routines set
                    </p>
                  </div>
                )}
              </div>
            </Card>

            <Card
              title="Recent Symptoms"
              description="Logged indicators and weather correlation"
            >
              <div className="flex flex-col gap-4">
                {symptoms.slice(0, 3).map((symptom) => {
                  const dotColor =
                    symptom.severity > 7 ? "bg-red-500" : "bg-orange-500";
                  return (
                    <div
                      key={symptom.id}
                      className="flex flex-col gap-2 p-4 border border-gray-200 rounded-md"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-semibold text-gray-900">
                          {symptom.description}
                        </span>
                        <Pill dotColor={dotColor}>
                          Severity: {symptom.severity}/10
                        </Pill>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar size={12} />
                          {new Date(symptom.logged_at).toLocaleDateString()}
                        </div>
                        {symptom.weather_temp && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Thermometer size={12} />
                            {symptom.weather_temp}°C •{" "}
                            {symptom.weather_condition}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {symptoms.length === 0 && (
                  <div className="text-center py-6 text-gray-400">
                    <p className="text-xs">No symptoms logged yet</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .font-inter { font-family: 'Inter', -apple-system, sans-serif; }
        @keyframes weatherPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
      `}</style>
    </div>
  );
}
