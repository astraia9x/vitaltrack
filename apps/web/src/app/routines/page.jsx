"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Plus,
  CheckCircle2,
  Clock,
  Calendar,
  MoreHorizontal,
  Trash2,
  Power,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Pill = ({ children, type = "outline" }) => (
  <span
    className={`${type === "soft" ? "bg-blue-50 text-blue-600 font-medium" : "bg-white border border-gray-200 text-gray-700"} rounded-full px-3 py-1 text-xs inline-flex items-center gap-1.5`}
  >
    {children}
  </span>
);

export default function RoutinesPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("Daily");
  const [timeOfDay, setTimeOfDay] = useState("Morning");

  const queryClient = useQueryClient();

  const { data: routines = [], isLoading } = useQuery({
    queryKey: ["routines"],
    queryFn: () => fetch("/api/routines").then((res) => res.json()),
  });

  const addRoutineMutation = useMutation({
    mutationFn: (newRoutine) =>
      fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRoutine),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
      setName("");
      setIsAdding(false);
    },
  });

  const toggleRoutineMutation = useMutation({
    mutationFn: ({ id, is_active }) =>
      fetch(`/api/routines/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active }),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
    },
  });

  const deleteRoutineMutation = useMutation({
    mutationFn: (id) =>
      fetch(`/api/routines/${id}`, { method: "DELETE" }).then((res) =>
        res.json(),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
    },
  });

  const handleAdd = (e) => {
    e.preventDefault();
    addRoutineMutation.mutate({ name, frequency, time_of_day: timeOfDay });
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
            Health Routines
          </h1>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white rounded-sm px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
        >
          <Plus size={16} />
          Add Routine
        </button>
      </header>

      <main className="p-8 max-w-5xl mx-auto w-full flex flex-col gap-8">
        {isAdding && (
          <div className="fixed inset-0 bg-gray-900/10 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-gray-200 p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                New Routine
              </h2>
              <form onSubmit={handleAdd} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Routine Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-sm p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    placeholder="E.g., Morning Vitamin D"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frequency
                    </label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="w-full border border-gray-200 rounded-sm p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    >
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time of Day
                    </label>
                    <select
                      value={timeOfDay}
                      onChange={(e) => setTimeOfDay(e.target.value)}
                      className="w-full border border-gray-200 rounded-sm p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    >
                      <option>Morning</option>
                      <option>Afternoon</option>
                      <option>Evening</option>
                      <option>Night</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 border border-gray-200 text-gray-700 rounded-sm py-2.5 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white rounded-sm py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Save Routine
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {routines.map((routine) => (
            <div
              key={routine.id}
              className={`bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-between gap-6 transition-all ${!routine.is_active ? "opacity-60 bg-gray-50" : "hover:border-gray-300"}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${routine.is_active ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400"}`}
                >
                  <CheckCircle2 size={20} />
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-base font-semibold ${routine.is_active ? "text-gray-900" : "text-gray-500"}`}
                  >
                    {routine.name}
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={12} />
                      {routine.time_of_day}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar size={12} />
                      {routine.frequency}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    toggleRoutineMutation.mutate({
                      id: routine.id,
                      is_active: !routine.is_active,
                    })
                  }
                  className={`p-2 rounded-sm transition-colors ${routine.is_active ? "text-gray-400 hover:text-orange-500 hover:bg-orange-50" : "text-blue-600 hover:bg-blue-50"}`}
                  title={routine.is_active ? "Pause" : "Activate"}
                >
                  <Power size={18} />
                </button>
                <button
                  onClick={() => deleteRoutineMutation.mutate(routine.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          {routines.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
              <CheckCircle2 size={40} className="mx-auto mb-4 text-gray-200" />
              <h3 className="text-gray-900 font-medium">No routines defined</h3>
              <p className="text-gray-500 text-sm">
                Create a routine to track your daily medications and habits.
              </p>
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .font-inter { font-family: 'Inter', sans-serif; }
      `}</style>
    </div>
  );
}
