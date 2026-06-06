import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import * as XLSX from "xlsx";
import { Copy, CheckCircle2, QrCode } from "lucide-react";
import dsvvLogo from "../imports/DSVV_Logo_English.png";
import csLogo from "../imports/Cs.PNG";
import dssplLogoImage from "../imports/WhatsApp_Image_2026-04-23_at_3.27.56_PM-removebg-preview.png";
import DSSPL_Logo from "../imports/DSVV_Logo_English.png";
import customQrCode from "../imports/caf59ae9-a203-45aa-987f-71bca138c95b.jpg";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";

type FormData = {
  name: string;
  id: string;
  course: string;
  semester: string;
  sport: string;
  email: string;
  phone: string;
  Dal: string;
  transactionId: string;
};

type Registration = FormData & {
  timestamp: string;
};

export default function App() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const UPI_ID = "dssplteam@ybl";
  const PAYMENT_AMOUNT = "10";
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=DSVV%20Sports%20Registration&am=${PAYMENT_AMOUNT}&cu=INR`;

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

 const onSubmit = (data: FormData) => {
    const timestamp = new Date().toLocaleString();

    // Update UI immediately — no waiting for network
    setRegistrations((prev) => [{ ...data, timestamp }, ...prev]);
    setShowSuccess(true);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => setShowSuccess(false), 3000);
    reset();

    // Fire-and-forget to Google Sheets in the background
    fetch(
      "https://script.google.com/macros/s/AKfycbxPZZqbNlzCC2toxV2I39V3FYumEVStd5Cybgx35zr0RtBC-JChZVRts-RvQT-AKwYp/exec",
      {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ registrations: [{ ...data, timestamp }] }),
      }
    ).catch((err) => console.error("Background sync failed:", err));
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
        "Dal": reg.Dal,
        "Email": reg.email,
        "Phone": reg.phone,
        "Transaction ID": reg.transactionId,
        "Registration Time": reg.timestamp,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");

    XLSX.writeFile(workbook, `DSSPL_Registrations_${new Date().toISOString().split('T')[0]}.xlsx`);
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
              <ImageWithFallback src={dsvvLogo} alt="DSVV Logo" className="h-12 md:h-16 object-contain" />
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center"
            >
              <ImageWithFallback src={csLogo} alt="CS Department" className="h-10 md:h-14 object-contain" />
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

      <div className="max-w-7xl mx-auto py-6 md:py-8 px-4 md:px-6 relative z-10">
        <div className="text-center mb-8 md:mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="inline-block mb-4 md:mb-6"
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 border-4 border-white/30 overflow-hidden w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
              <ImageWithFallback src={dssplLogoImage} alt="DSSPL Logo" className="w-full h-full object-cover rounded-full" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white mb-2 md:mb-3 drop-shadow-lg text-3xl md:text-4xl font-bold text-balance"
          >
            DSSPL Registration 2026
          </motion.h1>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-blue-100 text-base md:text-lg drop-shadow text-balance"
          >
            Join your team and compete at the highest level
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-4 md:gap-6 mt-6 md:mt-8"
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

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          {/* Registration Form */}
          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-2xl p-5 md:p-8 shadow-2xl h-fit lg:sticky lg:top-24 border-t-4 border-blue-600 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/5 rounded-full -ml-12 -mb-12"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5 md:mb-6 pb-5 md:pb-6 border-b-2 border-blue-100">
                <div className="bg-blue-600 text-white rounded-full p-2 md:p-3">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-foreground">Registration Form</h2>
                  <p className="text-xs md:text-sm text-muted-foreground">Fill in your details to join</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                <FormField label="Full Name" error={errors.name?.message} required>
                  <input
                    {...register("name", { required: "Name is required" })}
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </FormField>

                <FormField label="Scholar ID" error={errors.id?.message} required>
                  <input
                    {...register("id", { required: "Scholar ID is required" })}
                    type="text"
                    placeholder="e.g., 2424001"
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
                    <option value="Athletics">Athletics(100 m)</option>
                    <option value="Athletics">Athletics(400 m)</option>
                    <option value="Athletics">Athletics(relay Race)</option>
                    <option value="Kho-Kho">Kho-Kho</option>
                    <option value="Chess">Chess</option>
                    <option value="Carrom">Carrom</option>
                    <option value="Tug Of War">Tug Of War</option>
                    <option value="Long Jump">Long Jump</option>
                    <option value="Javelin Throw">Javelin Throw</option>
                    <option value="Discus throw">Discus throw</option>
                    <option value="Shot Put">Shot Put</option>
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

                <FormField label="Dal" error={errors.Dal?.message} required>
                  <select
                    {...register("Dal", { required: "Dal is required" })}
                    className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select Dal</option>
                    <option value="Adarsh Dal">Adarsh Dal</option>
                    <option value="Chanakya Dal">Chanakya Dal</option>
                    <option value="Rakshak Dal">Rakshak Dal</option>
                    <option value="Sankalp Dal">Sankalp Dal</option>
                    <option value="Shaurya Dal">Shaurya Dal</option>
                    <option value="Utkarsh Dal">Utkarsh Dal</option>
                    <option value="Vijay Dal">Vijay Dal</option>
                  </select>
                </FormField>
              </div>

              {/* Payment Section */}
              <div className="bg-blue-50/50 rounded-xl p-4 md:p-6 mb-6 md:mb-8 border border-blue-100 relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/50 rounded-bl-full -z-10 blur-xl"></div>
                <div className="flex items-center gap-3 mb-4 border-b border-blue-200/50 pb-4">
                  <div className="bg-blue-600 text-white rounded-lg p-2">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">Registration Fee Payment</h3>
                    <p className="text-xs md:text-sm text-blue-700/80">Scan QR or pay via UPI App</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-start mb-6">
                  <div className="bg-white p-2 md:p-3 rounded-xl shadow-sm border border-blue-100 flex-shrink-0 mx-auto md:mx-0">
                    <ImageWithFallback src={customQrCode} alt="Payment QR Code" className="w-24 h-24 md:w-32 md:h-32 object-contain" />
                  </div>
                  <div className="flex-1 w-full text-center md:text-left">
                    <div className="mb-4">
                      <span className="block text-sm text-blue-600 font-medium mb-1">Amount to Pay</span>
                      <span className="text-3xl font-bold text-blue-900">₹{PAYMENT_AMOUNT}</span>
                    </div>
                    
                    <div className="mb-4">
                      <span className="block text-sm text-blue-600 font-medium mb-1">UPI ID</span>
                      <div className="flex items-center justify-center md:justify-start gap-2 bg-white px-3 py-2 rounded-lg border border-blue-100">
                        <span className="font-mono text-sm text-slate-700">{UPI_ID}</span>
                        <button
                          type="button"
                          onClick={copyUpiId}
                          className="text-blue-600 hover:text-blue-800 transition-colors ml-2"
                        >
                          {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <a 
                      href={upiLink}
                      className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md md:hidden"
                    >
                      Pay Now with UPI App
                    </a>
                  </div>
                </div>

                <FormField label="Transaction / UTR ID" error={errors.transactionId?.message} required>
                  <input
                    {...register("transactionId", { required: "Transaction ID is required" })}
                    type="text"
                    placeholder="Enter the 12-digit UTR number"
                    className="w-full px-4 py-3 bg-white rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-blue-600/70 mt-1">Please enter the transaction reference number after successful payment.</p>
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
            className="bg-white rounded-2xl p-5 md:p-8 shadow-2xl border-t-4 border-indigo-600"
          >
            

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
                  {registrations.map((reg, index) => (
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
                        <DetailRow label="Dal" value={reg.Dal} />
                        <DetailRow label="TXN ID" value={reg.transactionId} />
                        <div className="col-span-2 mt-2 pt-2 border-t border-blue-100/50">
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
