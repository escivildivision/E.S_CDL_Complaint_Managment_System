import type { Complaint } from "../types";

interface DashboardProps {
    complaints: Complaint[];
    onViewAll: () => void;
    onAddComplaint: () => void;
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

export default function Dashboard({ complaints, onViewAll, onAddComplaint }: DashboardProps) {
    const sortedComplaints = [...complaints].sort((a, b) => {
        const numberA = Number.parseInt(a.complaintNo || "", 10);
        const numberB = Number.parseInt(b.complaintNo || "", 10);

        if (!Number.isNaN(numberA) && !Number.isNaN(numberB)) {
            return numberB - numberA;
        }

        return String(b.complaintNo || "").localeCompare(String(a.complaintNo || ""));
    });
    const totalComplaints = complaints.length;
    const completedCount = complaints.filter(
        (c) => c.remarks?.toLowerCase().includes("completed") || c.remarks?.toLowerCase().includes("done")
    ).length;
    const pendingCount = totalComplaints - completedCount;

    const priorityCounts = complaints.reduce(
        (acc, c) => {
            const p = c.priority?.toLowerCase() || "normal";
            acc[p] = (acc[p] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    return (
        <>
            {/* Welcome */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Welcome back, Admin 👋
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Here's what's happening with your complaints today.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onAddComplaint}
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/35 hover:shadow-emerald-500/50 cursor-pointer whitespace-nowrap"
                    >
                        ➕ Add Complaint
                    </button>
                    <button
                        onClick={onViewAll}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/35 hover:shadow-blue-500/50 cursor-pointer whitespace-nowrap"
                    >
                        📄 View All
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
                <div className="bg-white rounded-2xl p-6 flex items-center gap-4 shadow-sm border border-gray-100">
                    <div className="text-2xl w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">📊</div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-bold text-gray-900 leading-none tracking-tight">{totalComplaints}</span>
                        <span className="text-xs text-gray-500 font-medium mt-1">Total Complaints</span>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 flex items-center gap-4 shadow-sm border border-gray-100">
                    <div className="text-2xl w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">⏳</div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-bold text-gray-900 leading-none tracking-tight">{pendingCount}</span>
                        <span className="text-xs text-gray-500 font-medium mt-1">Pending</span>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 flex items-center gap-4 shadow-sm border border-gray-100">
                    <div className="text-2xl w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center shrink-0">✅</div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-bold text-gray-900 leading-none tracking-tight">{completedCount}</span>
                        <span className="text-xs text-gray-500 font-medium mt-1">Completed</span>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 flex items-center gap-4 shadow-sm border border-gray-100">
                    <div className="text-2xl w-14 h-14 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">📁</div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-bold text-gray-900 leading-none tracking-tight">{Object.keys(priorityCounts).length}</span>
                        <span className="text-xs text-gray-500 font-medium mt-1">Priority Levels</span>
                    </div>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">📈 Summary</h3>
                    <div className="flex flex-col gap-3.5">
                        <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>Total Complaints</span>
                            <span className="font-semibold text-gray-900">{totalComplaints}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>Completed</span>
                            <span className="font-semibold text-green-600">{completedCount}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>Pending</span>
                            <span className="font-semibold text-orange-600">{pendingCount}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>Categories</span>
                            <span className="font-semibold text-gray-900">
                                {[...new Set(complaints.map((c) => c.category))].length}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">🏷️ By Priority</h3>
                    <div className="flex flex-col gap-4">
                        {Object.entries(priorityCounts).map(([priority, count]) => (
                            <div key={priority} className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                    <span className={`w-2 h-2 rounded-full ${priority === "high" || priority === "urgent" ? "bg-red-500" : priority === "low" ? "bg-blue-500" : "bg-amber-500"}`}></span>
                                    <span className="capitalize">{priority}</span>
                                    <span className="ml-auto font-semibold text-gray-700">{count}</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${priority === "high" || priority === "urgent" ? "bg-gradient-to-r from-red-500 to-red-400" : priority === "low" ? "bg-gradient-to-r from-blue-500 to-blue-400" : "bg-gradient-to-r from-amber-500 to-amber-400"}`}
                                        style={{ width: `${totalComplaints > 0 ? (count / totalComplaints) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">🕐 Latest Complaints</h3>
                    <div className="flex flex-col gap-4">
                        {sortedComplaints.slice(0, 4).map((c, index) => (
                            <div key={`${c.complaintNo}-${index}`} className="flex items-start gap-3">
                                <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${c.remarks?.toLowerCase().includes("completed") ? "bg-green-500" : "bg-orange-500"}`}></div>
                                <div>
                                    <p className="text-xs font-medium text-gray-700">{c.complaintNo} — {c.category}</p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">{c.location} • {c.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Complaints Table */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-base font-semibold text-gray-900">📋 Recent Complaints</h3>
                    <button
                        onClick={onViewAll}
                        className="text-blue-500 border border-blue-500 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-50 cursor-pointer"
                    >
                        View All →
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide first:rounded-l-lg">Complaint No</th>
                                <th className="bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Person</th>
                                <th className="bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                                <th className="bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Details</th>
                                <th className="bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</th>
                                <th className="bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Remarks</th>
                                <th className="bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide last:rounded-r-lg">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedComplaints.slice(0, 5).map((item, index) => (
                                <tr key={`${item.complaintNo}-${index}`} className="hover:bg-gray-50/60">
                                    <td className="px-4 py-3.5 text-sm font-semibold text-blue-500 border-b border-gray-100">{item.complaintNo}</td>
                                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-900 border-b border-gray-100">{item.complainedPerson}</td>
                                    <td className="px-4 py-3.5 text-sm text-gray-600 border-b border-gray-100">{item.category}</td>
                                    <td className="px-4 py-3.5 text-sm text-gray-500 border-b border-gray-100 max-w-[260px] truncate">{item.complaintDetails}</td>
                                    <td className="px-4 py-3.5 border-b border-gray-100">
                                        <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${priorityStyles[item.priority?.toLowerCase()] || "bg-gray-50 text-gray-600"}`}>{item.priority}</span>
                                    </td>
                                    <td className="px-4 py-3.5 border-b border-gray-100">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColor(item.remarks)}`}>{item.remarks || "Pending"}</span>
                                    </td>
                                    <td className="px-4 py-3.5 text-xs text-gray-400 border-b border-gray-100">{item.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {complaints.length === 0 && (
                    <div className="text-center py-10 text-gray-400 text-sm">No complaints found.</div>
                )}
            </div>
        </>
    );
}
