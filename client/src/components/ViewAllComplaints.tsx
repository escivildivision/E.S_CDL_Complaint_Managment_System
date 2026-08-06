import { useState } from "react";
import type { Complaint } from "../types";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

interface ViewAllComplaintsProps {
    complaints: Complaint[];
    onBack: () => void;
    onAddComplaint: () => void;
    onUpdateComplaint: (complaintNo: string) => void;
    onRefresh?: () => void;
}

const priorityStyles: Record<string, string> = {
    high: "bg-red-50 text-red-600",
    urgent: "bg-red-50 text-red-600",
    normal: "bg-amber-50 text-amber-600",
    medium: "bg-amber-50 text-amber-600",
    low: "bg-blue-50 text-blue-600",
};

const statusColor = (remarks: string) => {
    const r = remarks?.toLowerCase() || "";
    if (r.includes("completed") || r.includes("done") || r.includes("resolved"))
        return "bg-green-50 text-green-700";
    if (r.includes("progress") || r.includes("working"))
        return "bg-blue-50 text-blue-700";
    return "bg-orange-50 text-orange-700";
};

export default function ViewAllComplaints({
    complaints,
    onBack,
    onAddComplaint,
    onUpdateComplaint,
    onRefresh,
}: ViewAllComplaintsProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFilter, setDateFilter] = useState("All");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [selectedPriority, setSelectedPriority] = useState("All Priorities");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [showModal, setShowModal] = useState(false);

    // Get unique categories and priorities dynamically from complaints data
    const categories = Array.from(new Set(complaints.map((c) => c.category).filter(Boolean)));
    const priorities = Array.from(new Set(complaints.map((c) => c.priority).filter(Boolean)));

    const handleClear = () => {
        setSearchQuery("");
        setDateFilter("All");
        setSelectedCategory("All Categories");
        setSelectedPriority("All Priorities");
        setStartDate("");
        setEndDate("");
    };

    const filteredComplaints = complaints.filter((c) => {
        // 1. Search Query Filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            const matchesSearch =
                c.complaintNo?.toLowerCase().includes(query) ||
                c.complainedPerson?.toLowerCase().includes(query) ||
                c.complaintDetails?.toLowerCase().includes(query) ||
                c.category?.toLowerCase().includes(query) ||
                c.location?.toLowerCase().includes(query) ||
                c.supervisor?.toLowerCase().includes(query);
            if (!matchesSearch) return false;
        }

        // 2. Category Filter
        if (selectedCategory !== "All Categories" && c.category !== selectedCategory) {
            return false;
        }

        // 3. Priority Filter
        if (
            selectedPriority !== "All Priorities" &&
            c.priority?.toLowerCase() !== selectedPriority.toLowerCase()
        ) {
            return false;
        }

        // 4. Quick Date Filter (Daily, Monthly, Yearly)
        if (c.date && dateFilter !== "All") {
            const itemDate = new Date(c.date);
            const today = new Date();

            if (dateFilter === "Daily") {
                if (itemDate.toDateString() !== today.toDateString()) return false;
            } else if (dateFilter === "Monthly") {
                if (
                    itemDate.getMonth() !== today.getMonth() ||
                    itemDate.getFullYear() !== today.getFullYear()
                )
                    return false;
            } else if (dateFilter === "Yearly") {
                if (itemDate.getFullYear() !== today.getFullYear()) return false;
            }
        }

        // 5. Custom Date Range Filter
        if (startDate && c.date) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const itemDate = new Date(c.date);
            if (itemDate < start) return false;
        }

        if (endDate && c.date) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            const itemDate = new Date(c.date);
            if (itemDate > end) return false;
        }

        return true;
    });

    const handleDownloadPDF = () => {
        toast.info("Generating PDF report... 📄");

        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);
        if (selectedCategory !== "All Categories") params.append("category", selectedCategory);
        if (selectedPriority !== "All Priorities") params.append("priority", selectedPriority);
        if (dateFilter !== "All") params.append("dateFilter", dateFilter);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        // Opens backend PDF report endpoint
        window.open(`${API_URL}/reports/download-complaints?${params.toString()}`, "_blank");
    };


    const handleViewComplaint = (item: Complaint) => {
        setSelectedComplaint(item);
        setShowModal(true);
    };


    const handleDeleteComplaint = async (complaintNo: string) => {
        // Show confirmation dialog
        const confirmed = window.confirm(
            `Are you sure you want to delete complaint ${complaintNo}?\n\nThis action cannot be undone.`
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/complaints/delete-complaint/${complaintNo}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete complaint");
            }

            toast.success("Complaint deleted successfully");
            onRefresh?.();

        } catch (error) {
            toast.error("Failed to delete complaint");
        }
    };


    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">All Complaints</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage and track all customer complaints</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={handleDownloadPDF}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:from-purple-600 hover:to-purple-700 cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                        📥 Download PDF
                    </button>
                    <button
                        onClick={onAddComplaint}
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-emerald-600 hover:to-emerald-700 cursor-pointer shadow-sm"
                    >
                        ➕ Add Complaint
                    </button>
                    <button
                        onClick={onBack}
                        className="bg-white text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 cursor-pointer shadow-sm"
                    >
                        ← Dashboard
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="mb-6 space-y-4">

                    {/* First Row */}
                    <div className="flex flex-col lg:flex-row justify-between gap-4">

                        <h3 className="text-base font-semibold text-gray-900 whitespace-nowrap">
                            Showing {filteredComplaints.length} of {complaints.length} complaints
                        </h3>

                        <input
                            type="text"
                            placeholder="🔍 Search by Complaint No, Person, Category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full lg:w-96 px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm"
                        />

                    </div>

                    {/* Second Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">

                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 outline-none focus:border-blue-500"
                        >
                            <option value="All">All Time</option>
                            <option value="Daily">Daily (Today)</option>
                            <option value="Monthly">Monthly (This Month)</option>
                            <option value="Yearly">Yearly (This Year)</option>
                        </select>

                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 outline-none focus:border-blue-500"
                        >
                            <option value="All Categories">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        <select
                            value={selectedPriority}
                            onChange={(e) => setSelectedPriority(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 outline-none focus:border-blue-500"
                        >
                            <option value="All Priorities">All Priorities</option>
                            {priorities.map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>

                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 outline-none focus:border-blue-500"
                        />

                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 outline-none focus:border-blue-500"
                        />

                        <button
                            onClick={handleClear}
                            className="bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                        >
                            Clear Filters
                        </button>

                    </div>

                </div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide first:rounded-l-lg">Complaint No</th>
                                <th className="bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Person</th>
                                <th className="bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Type of Work/Location</th>
                                <th className="bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                                <th className="bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Details</th>
                                <th className="bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Shift Incharge</th>
                                <th className="bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</th>
                                <th className="bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                <th className="bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Initial Date</th>
                                <th className="bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Completion Date</th>
                                <th className="bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide last:rounded-r-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredComplaints.map((item) => (
                                <tr key={item.complaintNo} onClick={() => handleViewComplaint(item)} className="hover:bg-gray-50/60 cursor-pointer">

                                    <td className="px-4 py-3.5 text-sm font-semibold text-blue-500 border-b border-gray-100">{item.complaintNo}</td>
                                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-900 border-b border-gray-100">{item.complainedPerson}</td>
                                    <td className="px-4 py-3.5 text-sm text-gray-600 border-b border-gray-100">{item.location}</td>
                                    <td className="px-4 py-3.5 text-sm text-gray-600 border-b border-gray-100">{item.category}</td>
                                    <td className="px-4 py-3.5 text-sm text-gray-500 border-b border-gray-100 max-w-[220px] truncate">{item.complaintDetails}</td>
                                    <td className="px-4 py-3.5 text-sm text-gray-600 border-b border-gray-100">{item.supervisor}</td>
                                    <td className="px-4 py-3.5 border-b border-gray-100">
                                        <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${priorityStyles[item.priority?.toLowerCase()] || "bg-gray-50 text-gray-600"}`}>{item.priority}</span>
                                    </td>
                                    <td className="px-4 py-3.5 border-b border-gray-100">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColor(item.remarks)}`}>{item.remarks || "Pending"}</span>
                                    </td>
                                    <td className="px-4 py-3.5 text-xs text-gray-400 border-b border-gray-100">{item.date}</td>
                                    <td className="px-4 py-3.5 text-xs text-emerald-600 font-medium border-b border-gray-100">{item.completionDate || "-"}</td>
                                    <td className="px-4 py-3.5 border-b border-gray-100 flex gap-2">
                                        <button

                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onUpdateComplaint(item.complaintNo)
                                            }}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                                        >
                                            Update
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteComplaint(item.complaintNo)
                                            }}
                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredComplaints.length === 0 && (
                    <div className="text-center py-10 text-gray-400 text-sm">
                        No complaints found matching your search.
                    </div>
                )}
            </div>
            {showModal && selectedComplaint && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden transform transition-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2.5">
                                <span className="text-xl">📋</span>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">Complaint Details</h3>
                                    <p className="text-xs text-slate-300 font-mono">{selectedComplaint.complaintNo}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div>
                                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block">Person</span>
                                    <span className="text-sm font-semibold text-gray-900 mt-0.5 block">{selectedComplaint.complainedPerson || "N/A"}</span>
                                </div>
                                <div>
                                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block">Type of Work/Location</span>
                                    <span className="text-sm font-semibold text-gray-900 mt-0.5 block">{selectedComplaint.location || "N/A"}</span>
                                </div>
                                <div>
                                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block">Category</span>
                                    <span className="text-sm font-semibold text-gray-900 mt-0.5 block">{selectedComplaint.category || "N/A"}</span>
                                </div>
                                <div>
                                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block">Supervisor</span>
                                    <span className="text-sm font-semibold text-gray-900 mt-0.5 block">{selectedComplaint.supervisor || "Unassigned"}</span>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">Complaint Details</span>
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{selectedComplaint.complaintDetails || "No details provided."}</p>
                            </div>

                            <div className="grid grid-cols-4 gap-3">
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                                    <span className="text-xs text-gray-400 font-medium block mb-1">Priority</span>
                                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold ${priorityStyles[selectedComplaint.priority?.toLowerCase()] || "bg-gray-100 text-gray-600"}`}>
                                        {selectedComplaint.priority || "Normal"}
                                    </span>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                                    <span className="text-xs text-gray-400 font-medium block mb-1">Status</span>
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor(selectedComplaint.remarks)}`}>
                                        {selectedComplaint.remarks || "Pending"}
                                    </span>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                                    <span className="text-xs text-gray-400 font-medium block mb-1">Date Created</span>
                                    <span className="text-xs font-semibold text-gray-700 block mt-1">{selectedComplaint.date || "N/A"}</span>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                                    <span className="text-xs text-gray-400 font-medium block mb-1">Completion Date</span>
                                    <span className="text-xs font-semibold text-green-700 block mt-1">{selectedComplaint.completionDate || "Pending"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
