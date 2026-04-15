import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import * as XLSX from "xlsx";
import dsvvLogo from "../imports/DSVV_Logo_English.png";
import csLogo from "../imports/Cs.PNG";

const SHEET_ID = "1wko8nor4TPBssNGKIK5283AJ-zZ-Yj394v4ZcUFXjRU";
const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

function parseCSV(text: string): Registration[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const parseRow = (line: string): string[] => {
    const cols: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { if (inQ && line[i + 1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
      else if (ch === "," && !inQ) { cols.push(cur); cur = ""; }
      else cur += ch;
    }
    cols.push(cur);
    return cols;
  };
  const headers = parseRow(lines[0]);
  return lines.slice(1).map((line) => {
    const vals = parseRow(line);
    const get = (key: string) => vals[headers.indexOf(key)] ?? "";
    return {
      name: get("Name"),
      id: get("Student ID"),
      course: get("Course"),
      semester: get("Semester"),
      sport: get("Sport"),
      email: get("Email"),
      phone: get("Phone"),
      timestamp: get("Registration Time"),
    } as Registration;
  }).filter((r) => r.name);
}

type FormData = {
  name: string;
  id: string;
  course: string;
  semester: string;
  sport: string;
  email: string;
  phone: string;
};

type Registration = FormData & {
  timestamp: string;
};

export default function App() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncMsg, setSyncMsg] = useState("");
  const [search, setSearch] = useState("");

  const syncFromSheets = useCallback(async () => {
    setSyncStatus("syncing");
    setSyncMsg("Syncing from Google Sheets…");
    try {
      const res = await fetch(SHEET_CSV_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const imported = parseCSV(text);
      setRegistrations(imported);
      setSyncStatus("success");
      setSyncMsg(`Synced ${imported.length} registration${imported.length !== 1 ? "s" : ""} from Google Sheets`);
      setTimeout(() => setSyncMsg(""), 4000);
    } catch (e: unknown) {
      setSyncStatus("error");
      setSyncMsg(e instanceof Error ? e.message : "Sync failed — make sure sheet is shared publicly");
      setTimeout(() => setSyncMsg(""), 5000);
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    const newRegistration: Registration = {
      ...data,
      timestamp: new Date().toLocaleString(),
    };

    setRegistrations((prev) => [newRegistration, ...prev]);
    setShowSuccess(true);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);

    reset();
  };

  const exportToExcel = () => {
    if (registrations.length === 0) {
      alert("No registrations to export!");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      registrations.map((reg, index) => ({
        "S.No": registrations.length - index,
        "Name": reg.name,
        "Student ID": reg.id,
        "Course": reg.course,
        "Semester": reg.semester,
        "Sport": reg.sport,
        "Email": reg.email,
        "Phone": reg.phone,
        "Registration Time": reg.timestamp,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");

    XLSX.writeFile(workbook, `Sports_Registrations_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const deleteRegistration = (index: number) => {
    setRegistrations((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-svh bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden">
      {/* Navbar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center"
            >
              <img src={dsvvLogo} alt="DSVV Logo" className="h-16 object-contain" />
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center"
            >
              <img src={csLogo} alt="CS Department" className="h-14 object-contain" />
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border-4 border-white rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 border-4 border-white rounded-full"></div>
        <div className="absolute bottom-40 right-1/3 w-20 h-20 border-4 border-white rounded-full"></div>
        <div className="absolute top-0 left-1/4 w-1 h-full bg-white/20"></div>
        <div className="absolute top-0 left-2/4 w-1 h-full bg-white/20"></div>
        <div className="absolute top-0 left-3/4 w-1 h-full bg-white/20"></div>
        <div className="absolute top-1/2 left-0 w-full h-1 bg-white/20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-white rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-6 relative z-10">
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="inline-block mb-6"
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 border-4 border-white/30">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
          </motion.div>

          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white mb-3 drop-shadow-lg"
          >
            Sports Registration 2026
          </motion.h1>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-blue-100 text-lg drop-shadow"
          >
            Join your team and compete at the highest level
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-6 mt-8"
          >
            <SportIcon>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M12 2a10 10 0 0 0 0 20" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M2 12h20" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </SportIcon>
            <SportIcon>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
            </SportIcon>
            <SportIcon>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </SportIcon>
            <SportIcon>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </SportIcon>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Registration Form */}
          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-2xl p-8 shadow-2xl h-fit lg:sticky lg:top-24 border-t-4 border-blue-600 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/5 rounded-full -ml-12 -mb-12"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b-2 border-blue-100">
                <div className="bg-blue-600 text-white rounded-full p-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-foreground">Registration Form</h2>
                  <p className="text-sm text-muted-foreground">Fill in your details to join</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <FormField label="Full Name" error={errors.name?.message} required>
                  <input
                    {...register("name", { required: "Name is required" })}
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </FormField>

                <FormField label="Student ID" error={errors.id?.message} required>
                  <input
                    {...register("id", { required: "Student ID is required" })}
                    type="text"
                    placeholder="e.g., 2024001"
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </FormField>

                <FormField label="Course" error={errors.course?.message} required>
                  <input
                    {...register("course", { required: "Course is required" })}
                    type="text"
                    placeholder="e.g., Computer Science"
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </FormField>

                <FormField label="Semester" error={errors.semester?.message} required>
                  <select
                    {...register("semester", { required: "Semester is required" })}
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select semester</option>
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                    <option value="3">Semester 3</option>
                    <option value="4">Semester 4</option>
                    <option value="5">Semester 5</option>
                    <option value="6">Semester 6</option>
                    <option value="7">Semester 7</option>
                    <option value="8">Semester 8</option>
                  </select>
                </FormField>

                <FormField label="Sport" error={errors.sport?.message} required>
                  <select
                    {...register("sport", { required: "Sport selection is required" })}
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select sport</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Football">Football</option>
                    <option value="Cricket">Cricket</option>
                    <option value="Volleyball">Volleyball</option>
                    <option value="Badminton">Badminton</option>
                    <option value="Table Tennis">Table Tennis</option>
                    <option value="Athletics">Athletics</option>
                    <option value="Swimming">Swimming</option>
                    <option value="Tennis">Tennis</option>
                    <option value="Hockey">Hockey</option>
                  </select>
                </FormField>

                <FormField label="Email" error={errors.email?.message} required>
                  <input
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    type="email"
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </FormField>

                <FormField label="Phone Number" error={errors.phone?.message} required>
                  <input
                    {...register("phone", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Please enter a valid 10-digit phone number",
                      },
                    })}
                    type="tel"
                    placeholder="e.g., 9876543210"
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </FormField>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Register Now
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </motion.button>

              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
                  >
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-green-800">Registration successful!</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.form>

          {/* Registrations List */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-8 shadow-2xl border-t-4 border-indigo-600"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-foreground mb-1">Registrations</h2>
                <p className="text-muted-foreground">
                  {registrations.length} {registrations.length === 1 ? "participant" : "participants"} registered
                </p>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={syncFromSheets}
                  disabled={syncStatus === "syncing"}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg transition-all shadow-md text-sm disabled:opacity-60"
                  title="Sync from Google Sheets"
                >
                  <svg className={`w-4 h-4 ${syncStatus === "syncing" ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {syncStatus === "syncing" ? "Syncing…" : "Sync Sheets"}
                </motion.button>
                {registrations.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={exportToExcel}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export
                  </motion.button>
                )}
                <a
                  href={`https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 px-3 py-2.5 rounded-lg hover:bg-blue-50 transition-all border border-blue-200"
                  title="Open Google Sheet"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Sheets
                </a>
              </div>
            </div>

            {/* Sync status message */}
            {syncMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mb-4 px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 ${
                  syncStatus === "error"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}
              >
                {syncStatus === "error" ? (
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {syncMsg}
              </motion.div>
            )}

            {/* Search bar */}
            {registrations.length > 0 && (
              <div className="relative mb-4">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="search"
                  placeholder="Search by name, sport, ID…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            )}

            {registrations.length === 0 ? (
              <div className="text-center py-16">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-blue-200"
                >
                  <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                </motion.div>
                <h3 className="text-foreground mb-2">Ready to Start!</h3>
                <p className="text-muted-foreground">Register your first participant to begin</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                <AnimatePresence mode="popLayout">
                  {registrations
                    .filter((reg) =>
                      search === "" ||
                      [reg.name, reg.id, reg.sport, reg.course, reg.email].some((v) =>
                        v.toLowerCase().includes(search.toLowerCase())
                      )
                    )
                    .map((reg, index) => (
                    <motion.div
                      key={`${reg.id}-${reg.timestamp}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      layout
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-l-4 border-blue-600 hover:border-blue-700 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-600 text-white rounded-full p-2 mt-1">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-foreground mb-1">{reg.name}</h3>
                            <p className="text-sm text-muted-foreground">ID: {reg.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-sm font-medium shadow-md">
                            {reg.sport}
                          </span>
                          <button
                            onClick={() => deleteRegistration(index)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                            title="Delete registration"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <DetailRow label="Course" value={reg.course} />
                        <DetailRow label="Semester" value={reg.semester} />
                        <DetailRow label="Email" value={reg.email} />
                        <DetailRow label="Phone" value={reg.phone} />
                        <div className="col-span-2">
                          <DetailRow label="Registered" value={reg.timestamp} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function SportIcon({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.2, rotate: 5 }}
      className="bg-white/20 backdrop-blur-sm rounded-full p-3 text-white border-2 border-white/30"
    >
      {children}
    </motion.div>
  );
}

function FormField({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block mb-2 text-foreground">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm mt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
