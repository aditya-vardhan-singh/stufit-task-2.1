"use client";


import { useEffect, useState } from "react";
import Image from "next/image";
import { Bell, LogOut } from "lucide-react";
import HealthDrilldownChart from "@/components/HealthDrilldownChart";
import HealthSummaryBarChart from "@/components/HealthSummaryChart";
import ProtectedRoute from "@/components/ProtectedRoute";
import { authUtils } from "@/lib/auth";
import api from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Student } from "@/data/mockStudents";


const DEFECT_TYPES = [
  "eye",
  "hearing",
  "fitness",
  "psychological",
  "dental",
  "orthopedic",
  "ent",
];


function HodDashboard() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDefectType, setSelectedDefectType] = useState("eye");
  const [selectedGrade, setSelectedGrade] = useState<string>("All");
  const [selectedSession, setSelectedSession] = useState<string>("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");


  useEffect(() => {
    api
      // .get("/hod-filter-medical-records")
      .get('/students/all')
      .then((response) => {
        setStudents(response.data);
      })
      .catch((err) => {
        console.error("Failed to fetch students:", err);
        // Handle specific error cases
        if (err.response?.status === 401) {
          console.error("Unauthorized - redirecting to login");
          authUtils.clearAuth();
          router.push("/login");
        }
      });
  }, [router]);


  const handleLogout = () => {
    authUtils.clearAuth();
    router.push("/login");
  };


  const uniqueGrades = Array.from(
    new Set(students.map((s) => s.grade).filter(Boolean))
  );
  const uniqueSessions = Array.from(
    new Set(students.map((s) => s.session).filter(Boolean))
  );


  const filtered = students.filter((student) => {
    const inGrade = selectedGrade === "All" || student.grade === selectedGrade;
    const inSession =
      selectedSession === "All" || student.session === selectedSession;
    const inDateRange =
      (!startDate ||
        new Date(student.admission_date!) >= new Date(startDate)) &&
      (!endDate || new Date(student.admission_date!) <= new Date(endDate));


    return inGrade && inSession && inDateRange;
  });


  const handleReset = () => {
    setSelectedDefectType("eye");
    setSelectedGrade("All");
    setSelectedSession("All");
    setStartDate("");
    setEndDate("");
  };
  


  return (
    <div className="min-h-screen bg-[#f4faff]">
      <header className="bg-[#69b9f3] text-white flex items-center justify-between px-4 md:px-8 py-4 rounded-b-3xl shadow-md">
        <div className="flex items-center space-x-4">
          <Image
            src="/circleLogo.png"
            alt="Stufit Logo"
            width={50}
            height={50}
          />
          <h1 className="text-lg md:text-xl font-semibold">Stufit</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Bell className="w-6 h-6 cursor-pointer" />
          <LogOut className="w-6 h-6 cursor-pointer" onClick={handleLogout} />
        </div>
      </header>


      <section className="text-center py-6">
        <h2 className="text-3xl font-bold text-blue-900">HoD Dashboard</h2>
        <p className="text-blue-700">Viewing assigned students' health data</p>
      </section>


      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-wrap gap-4 items-end justify-center pb-4">
        <div>
          <label className="block mb-1 text-sm text-blue-900">Grade</label>
          <select
            className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-white text-blue-900 shadow-sm"
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
          >
            <option value="All">All</option>
            {uniqueGrades.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>


        <div>
          <label className="block mb-1 text-sm text-blue-900">Session</label>
          <select
            className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-white text-blue-900 shadow-sm"
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
          >
            <option value="All">All</option>
            {uniqueSessions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>


        <div>
          <label className="block mb-1 text-sm text-blue-900">From</label>
          <input
            type="date"
            className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-white text-blue-900 shadow-sm"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>


        <div>
          <label className="block mb-1 text-sm text-blue-900">To</label>
          <input
            type="date"
            className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-white text-blue-900 shadow-sm"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>


        <div className="block mb-1 text-sm text-blue-900">
          <label className="block mb-2 text-sm font-medium text-blue-900">
            Select Defect Type:
          </label>
          <select
            className="w-full md:w-64 px-4 py-2 border border-slate-300 rounded-xl bg-white text-blue-900 shadow-sm"
            value={selectedDefectType}
            onChange={(e) => setSelectedDefectType(e.target.value)}
          >
            {DEFECT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>


        <div className="block mb-1 text-sm text-blue-900">
          <button
            className="bg-red-500 text-white px-5 py-2 rounded-xl shadow-md hover:bg-red-600 transition"
            onClick={handleReset}
          >
            Reset Filters
          </button>
        </div>
      </div>


      <section className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
        <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-200">
          <HealthSummaryBarChart data={filtered} />
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-200">
          <HealthDrilldownChart
            data={filtered}
            defectType={selectedDefectType as keyof Student["defects"]}
          />
        </div>
      </section>
    </div>
  );
}


export default function ProtectedHodDashboard() {
  return (
    <ProtectedRoute allowedRoles={["admin", "hod"]}>
    <HodDashboard />
    </ProtectedRoute>
  );
}
