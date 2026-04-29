"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Calendar,
  Clock,
  User,
  MapPin,
  MoreHorizontal,
  Stethoscope,
  ChevronRight,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Pill = ({ children, type = "outline" }) => (
  <span
    className={`${type === "soft" ? "bg-blue-50 text-blue-600 font-medium" : "bg-white border border-gray-200 text-gray-700"} rounded-full px-3 py-1 text-xs inline-flex items-center gap-1.5`}
  >
    {children}
  </span>
);

export default function AppointmentsPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [doctorName, setDoctorName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");

  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => fetch("/api/appointments").then((res) => res.json()),
  });

  const addAppointmentMutation = useMutation({
    mutationFn: (newAppointment) =>
      fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAppointment),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setDoctorName("");
      setSpecialty("");
      setDate("");
      setReason("");
      setIsAdding(false);
    },
  });

  const handleAdd = (e) => {
    e.preventDefault();
    addAppointmentMutation.mutate({
      doctor_name: doctorName,
      specialty,
      appointment_date: date,
      reason,
    });
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
            Appointments
          </h1>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white rounded-sm px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
        >
          <Plus size={16} />
          Schedule Visit
        </button>
      </header>

      <main className="p-8 max-w-5xl mx-auto w-full flex flex-col gap-8">
        {isAdding && (
          <div className="fixed inset-0 bg-gray-900/10 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-gray-200 p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                New Appointment
              </h2>
              <form onSubmit={handleAdd} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor Name
                  </label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-sm p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    placeholder="E.g., Dr. Smith"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialty
                  </label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full border border-gray-200 rounded-sm p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    placeholder="E.g., Cardiology"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-sm p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason for Visit
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full border border-gray-200 rounded-sm p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    placeholder="E.g., Follow-up on recent labs"
                    rows={2}
                  />
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
                    Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Upcoming Visits
              </h2>
              <p className="text-sm text-gray-500">
                Manage your medical appointments and consultations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {appointments.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-gray-300 transition-colors group"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <Stethoscope size={24} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold text-gray-900">
                        Dr. {app.doctor_name}
                      </span>
                      <Pill type="soft">{app.status}</Pill>
                    </div>
                    <span className="text-sm text-gray-500">
                      {app.specialty} • {app.reason}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-8 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <Calendar size={14} className="text-gray-400" />
                      {new Date(app.appointment_date).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric", year: "numeric" },
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <Clock size={14} className="text-gray-400" />
                      {new Date(app.appointment_date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-sm transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            ))}

            {appointments.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                <Calendar size={40} className="mx-auto mb-4 text-gray-200" />
                <h3 className="text-gray-900 font-medium">
                  No appointments scheduled
                </h3>
                <p className="text-gray-500 text-sm">
                  Keep track of your medical visits by adding them here.
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
