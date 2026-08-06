import { useState, useEffect } from "react";
import type { Complaint } from "./types";
import Dashboard from "./components/Dashboard";
import ViewAllComplaints from "./components/ViewAllComplaints";
import AddComplaint from "./components/AddComplaint";
import UpdateComplaint from "./components/UpdateComplaint";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type View = "dashboard" | "complaints" | "addComplaint" | "updateComplaint";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function App() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [selectedComplaintNo, setSelectedComplaintNo] = useState<string>("");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/complaints/get-all-complaints`);
      const json = await res.json();
      if (json.success) {
        setComplaints(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = (complaintNo: string) => {
    setSelectedComplaintNo(complaintNo);
    setCurrentView("updateComplaint");
  };



  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <header className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-10 h-[72px] flex justify-between items-center shadow-lg">
        <div
          className="flex items-center gap-3.5 cursor-pointer"
          onClick={() => setCurrentView("dashboard")}
        >
          <div className="text-2xl w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center">
            📋
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-tight">
              Complaint Manager
            </h1>
            <p className="text-xs opacity-70">Service Management Dashboard</p>
          </div>
        </div>
        <span className="text-sm opacity-80 font-medium">📅 {today}</span>
      </header>

      <main className="max-w-6xl mx-auto px-10 py-8">
        {loading && (
          <div className="text-center py-20 text-gray-400 text-lg">
            Loading complaints...
          </div>
        )}

        {!loading && currentView === "dashboard" && (
          <Dashboard
            complaints={complaints}
            onViewAll={() => setCurrentView("complaints")}
            onAddComplaint={() => setCurrentView("addComplaint")}
          />
        )}

        {!loading && currentView === "complaints" && (
          <ViewAllComplaints
            complaints={complaints}
            onBack={() => setCurrentView("dashboard")}
            onAddComplaint={() => setCurrentView("addComplaint")}
            onUpdateComplaint={handleUpdateClick}
            onRefresh={fetchComplaints}
          />
        )}

        {!loading && currentView === "addComplaint" && (
          <AddComplaint
            onBack={() => setCurrentView("dashboard")}
            onComplaintAdded={() => {
              fetchComplaints();
              setCurrentView("complaints");
            }}
          />
        )}

        {!loading && currentView === "updateComplaint" && (
          <UpdateComplaint
            complaintNo={selectedComplaintNo}
            onBack={() => setCurrentView("complaints")}
            onComplaintUpdated={() => {
              fetchComplaints();
              setCurrentView("complaints");
            }}
          />
        )}

      </main>
    </div>
  );
}

export default App;