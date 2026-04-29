"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Plus,
  FileText,
  Calendar,
  Tag,
  Search,
  Filter,
  MoreHorizontal,
  ChevronRight,
  Download,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Pill = ({ children, type = "outline" }) => (
  <span
    className={`${type === "soft" ? "bg-blue-50 text-blue-600 font-medium" : "bg-white border border-gray-200 text-gray-700"} rounded-full px-3 py-1 text-xs inline-flex items-center gap-1.5`}
  >
    {children}
  </span>
);

export default function RecordsPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("General");

  const queryClient = useQueryClient();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["records"],
    queryFn: () => fetch("/api/records").then((res) => res.json()),
  });

  const addRecordMutation = useMutation({
    mutationFn: (newRecord) =>
      fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records"] });
      setTitle("");
      setDescription("");
      setDate("");
      setIsAdding(false);
    },
  });

  const handleAdd = (e) => {
    e.preventDefault();
    addRecordMutation.mutate({ title, description, record_date: date, type });
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
            Health Records
          </h1>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white rounded-sm px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
        >
          <Plus size={16} />
          Add Record
        </button>
      </header>

      <main className="p-8 max-w-6xl mx-auto w-full flex flex-col gap-8">
        {isAdding && (
          <div className="fixed inset-0 bg-gray-900/10 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-gray-200 p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                New Health Record
              </h2>
              <form onSubmit={handleAdd} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Record Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-sm p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    placeholder="E.g., Annual Physical Exam"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full border border-gray-200 rounded-sm p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full border border-gray-200 rounded-sm p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    >
                      <option>General</option>
                      <option>Lab Result</option>
                      <option>Prescription</option>
                      <option>Imaging</option>
                      <option>Vaccination</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Summary/Notes
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-gray-200 rounded-sm p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    placeholder="E.g., All results normal, updated tetanus shot."
                    rows={3}
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
                    Save Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search records..."
              className="w-full border border-gray-200 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <Filter size={14} />
              Filter by Type
            </button>
            <Pill type="soft">{records.length} Total Records</Pill>
          </div>
        </div>

        {/* Grid Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4 hover:border-gray-300 transition-colors group"
            >
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                  <FileText size={20} />
                </div>
                <Pill type="soft">{record.type}</Pill>
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {record.title}
                </h3>
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Calendar size={12} />
                  {new Date(record.record_date).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
                {record.description || "No description provided."}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <button className="text-xs font-medium text-blue-600 hover:underline inline-flex items-center gap-1">
                  View Full Details
                  <ChevronRight size={12} />
                </button>
                <button className="text-gray-400 hover:text-gray-900 transition-colors">
                  <Download size={14} />
                </button>
              </div>
            </div>
          ))}

          {records.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
              <FileText size={40} className="mx-auto mb-4 text-gray-200" />
              <h3 className="text-gray-900 font-medium">No records found</h3>
              <p className="text-gray-500 text-sm">
                Upload or log your health records to keep them in one secure
                place.
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
