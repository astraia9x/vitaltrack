"use client";

import React, { useState } from "react";
import {
  Cloud,
  Plus,
  ArrowLeft,
  Thermometer,
  Wind,
  Droplets,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

export default function SymptomsPage() {
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState(5);
  const [city, setCity] = useState("San Francisco");
  const [isLogging, setIsLogging] = useState(false);

  const queryClient = useQueryClient();

  const { data: symptoms = [], isLoading } = useQuery({
    queryKey: ["symptoms"],
    queryFn: async () => {
      const res = await fetch("/api/symptoms");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const logSymptomMutation = useMutation({
    mutationFn: async (newSymptom) => {
      const res = await fetch("/api/symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSymptom),
      });
      if (!res.ok) throw new Error("Failed to log");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["symptoms"] });
      setDescription("");
      setSeverity(5);
      setIsLogging(false);
    },
  });

  const handleLogSymptom = (e) => {
    e.preventDefault();
    logSymptomMutation.mutate({ description, severity, city });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-inter">
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
          </a>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
            Symptom Log
          </h1>
        </div>
        <button
          onClick={() => setIsLogging(true)}
          className="bg-blue-600 text-white rounded-sm px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
        >
          <Plus size={16} />
          Log Symptom
        </button>
      </header>

      <main className="p-8 max-w-5xl mx-auto w-full flex flex-col gap-8">
        {/* Logging Form Overlay */}
        {isLogging && (
          <div className="fixed inset-0 bg-gray-900/10 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-gray-200 p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Log New Symptom
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Record how you're feeling and capture local weather conditions.
              </p>

              <form onSubmit={handleLogSymptom} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-sm p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    placeholder="E.g., Mild headache, joint pain..."
                    rows={3}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity (1-10)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={severity}
                      onChange={(e) => setSeverity(parseInt(e.target.value))}
                      className="flex-1 accent-blue-600"
                    />
                    <span className="text-sm font-semibold text-gray-900 w-6">
                      {severity}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-sm p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    placeholder="San Francisco"
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsLogging(false)}
                    className="flex-1 border border-gray-200 text-gray-700 rounded-sm py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={logSymptomMutation.isLoading}
                    className="flex-1 bg-blue-600 text-white rounded-sm py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {logSymptomMutation.isLoading ? "Logging..." : "Save Log"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* History List */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Symptom History
              </h2>
              <p className="text-sm text-gray-500">
                Track correlations between health and environment.
              </p>
            </div>
            <Pill type="soft">{symptoms.length} Logs</Pill>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {isLoading ? (
              <div className="text-center py-12 text-gray-400">
                Loading history...
              </div>
            ) : (
              symptoms.map((symptom) => (
                <div
                  key={symptom.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-gray-300 transition-colors"
                >
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-semibold text-gray-900">
                        {symptom.description}
                      </span>
                      <Pill
                        dotColor={
                          symptom.severity > 7 ? "bg-red-500" : "bg-orange-500"
                        }
                      >
                        Level {symptom.severity}
                      </Pill>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {new Date(symptom.logged_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <AlertCircle size={14} />
                        Logged at{" "}
                        {new Date(symptom.logged_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8">
                    {symptom.weather_temp ? (
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900">
                            {symptom.weather_temp}°C
                          </span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                            Temperature
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900">
                            {symptom.weather_condition}
                          </span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                            Condition
                          </span>
                        </div>
                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                          <Cloud size={16} />
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        No weather data captured
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
            {symptoms.length === 0 && !isLoading && (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                <Cloud size={40} className="mx-auto mb-4 text-gray-200" />
                <h3 className="text-gray-900 font-medium">
                  No symptoms logged yet
                </h3>
                <p className="text-gray-500 text-sm">
                  Log your first symptom to start tracking health patterns.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .font-inter { font-family: 'Inter', sans-serif; }
      `}</style>
    </div>
  );
}
