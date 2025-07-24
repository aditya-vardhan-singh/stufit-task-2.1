"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Bell,
  LogOut,
  User,
  Calendar,
  School,
  Cake,
  HeartPulse,
  ClipboardList,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { parentData } from "@/data/parentData";
import { Student } from "@/data/mockStudents";
import ProtectedRoute from "@/components/ProtectedRoute";

const FATHER_NAME = "Parent1"; // Replace with dynamic login later

function ParentPage() {
  const [selectedChild, setSelectedChild] = useState<string>("All");

  const myChildren: Student[] = parentData.filter(
    (s) => s.fathers_name === FATHER_NAME
  );

  const filteredData =
    selectedChild === "All"
      ? myChildren
      : myChildren.filter((child) => child.name === selectedChild);

  return (
    <div className="min-h-screen bg-[#f4faff]">
      {/* Header */}
      <header className="bg-[#69b9f3] text-white flex items-center justify-between px-6 py-4 rounded-b-3xl shadow-md">
        <div className="flex items-center gap-4">
          <Image src="/circleLogo.png" alt="Stufit Logo" width={50} height={50} />
          <h1 className="text-xl font-semibold">Stufit</h1>
        </div>
        <div className="flex items-center gap-4">
          <Bell className="w-6 h-6 cursor-pointer hover:text-gray-200" />
          <LogOut className="w-6 h-6 cursor-pointer hover:text-gray-200" />
        </div>
      </header>

      {/* Title */}
      <section className="text-center py-6">
        <h2 className="text-3xl font-bold text-blue-900">Parent Dashboard</h2>
        <p className="text-blue-700">
          Viewing health reports for children of {FATHER_NAME}
        </p>
      </section>

      {/* Child Filter */}
      <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-4 pb-8">
        <div className="w-full max-w-xs">
          <label className="block mb-2 text-sm font-medium text-blue-900">
            Select Child:
          </label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-white text-blue-900 shadow-sm focus:ring-2 focus:ring-blue-300"
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
          >
            <option value="All">All Children</option>
            {myChildren.map((child) => (
              <option key={child.id} value={child.name}>
                {child.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Cards */}
      <section className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        {filteredData.map((student) => (
          <div
            key={student.id}
            className="bg-white rounded-3xl p-6 shadow-md border border-gray-200 transition hover:shadow-lg"
          >
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="text-blue-700" />
              <h3 className="text-xl font-semibold text-blue-800">
                {student.name}'s Health Report
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-blue-900 text-sm">
              <p className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">Name:</span> {student.name}
              </p>
              <p className="flex items-center gap-2">
                <School className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">Grade:</span> {student.grade}
              </p>
              <p className="flex items-center gap-2">
                <Cake className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">Age:</span> {student.age}
              </p>
              <p className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">Gender:</span> {student.gender}
              </p>
              <p className="flex items-center gap-2">
                <School className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">School:</span> {student.school}
              </p>
              <p className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">Session:</span> {student.session}
              </p>
              <p className="flex items-center gap-2 sm:col-span-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">Screening Date:</span> {student.date}
              </p>
            </div>

            <hr className="my-4 border-gray-200" />

            <div>
              <div className="flex items-center gap-2 mb-2">
                <HeartPulse className="text-pink-600" />
                <h4 className="text-lg font-semibold text-blue-800">
                  Detected Health Issues
                </h4>
              </div>

              {Object.entries(student.defects).length === 0 ? (
                <p className="flex items-center text-green-600 font-medium mt-2">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  No health issues found.
                </p>
              ) : (
                <ul className="space-y-2 mt-2">
                  {Object.entries(student.defects).map(([type, value]) => (
                    <li
                      key={type}
                      className="flex items-center gap-2 bg-blue-50 rounded-xl p-3 border border-blue-200 hover:bg-blue-100 transition"
                    >
                      <AlertTriangle className="text-red-500" />
                      <span className="capitalize font-medium text-blue-800">
                        {type} —{" "}
                        <span className="text-slate-700">{value?.subType}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="text-center pb-6 text-gray-500 text-sm">
        🩺 Generated by Stufit Health Screening System
      </footer>
    </div>
  );
}

// Role-based protected route wrapper
export default function ProtectedParentPage() {
  return (
    //<ProtectedRoute allowedRoles={["parent"]}>
    <ParentPage />
    //</ProtectedRoute>
  );
}
