import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

interface CategoryItem {
    id: string;
    category: string;
}

interface PriorityItem {
    id: string;
    priority: string;
}

interface UpdateComplaintProps {
    complaintNo: string;
    onBack: () => void;
    onComplaintUpdated: () => void;
}

const emptyForm = {
    complaintNo: "",
    date: new Date().toISOString().split("T")[0],
    location: "",
    category: "",
    complainedPerson: "",
    complaintDetails: "",
    timeNote: "",
    timeDone: "",
    supervisor: "",
    priority: "",
    remarks: "",
    materialConsumed: "",
    attendedBy: "",
    numberOfWorkers: 1,
    completionDate: "",
};

export default function UpdateComplaint({
    complaintNo,
    onBack,
    onComplaintUpdated,
}: UpdateComplaintProps) {
    const [form, setForm] = useState({ ...emptyForm, complaintNo });
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [priorities, setPriorities] = useState<PriorityItem[]>([]);
    const [loadingComplaint, setLoadingComplaint] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchDropdowns();
        if (complaintNo) {
            fetchSpecificComplaint();
        }
    }, [complaintNo]);

    const fetchSpecificComplaint = async () => {
        try {
            setLoadingComplaint(true);
            const res = await fetch(
                `${API_URL}/complaints/get-specific-complaint/${complaintNo}`
            );
            const json = await res.json();
            if (json.success && json.data) {
                const d = json.data;
                setForm({
                    complaintNo: d["Complaint No"] || d.complaintNo || complaintNo,
                    date: d["Date"] || d.date || "",
                    location: d["Location"] || d.location || "",
                    category: d["Category"] || d.category || "",
                    complainedPerson: d["Complained Person"] || d.complainedPerson || "",
                    complaintDetails: d["Complaint Details"] || d.complaintDetails || "",
                    timeNote: d["Time Note"] || d.timeNote || "",
                    timeDone: d["Time Done"] || d.timeDone || "",
                    supervisor: d["Supervisor"] || d.supervisor || "",
                    priority: d["Priority"] || d.priority || "",
                    remarks: d["Remarks"] || d.remarks || "",
                    materialConsumed: d["Material Consumed"] || d.materialConsumed || "",
                    attendedBy: d["Attended By"] || d.attendedBy || "",
                    numberOfWorkers: d["Number of Workers"] || d.numberOfWorkers || 1,
                    completionDate: d["Completion Date"] || d.completionDate || "",
                });
            }
        } catch (err) {
            console.error("Failed to fetch specific complaint:", err);
            toast.error("Failed to load complaint details");
        } finally {
            setLoadingComplaint(false);
        }
    };

    const fetchDropdowns = async () => {
        try {
            const [catRes, priRes] = await Promise.all([
                fetch(`${API_URL}/categories`),
                fetch(`${API_URL}/priorities`),
            ]);
            const catJson = await catRes.json();
            const priJson = await priRes.json();
            if (catJson.success) setCategories(catJson.data);
            if (priJson.success) setPriorities(priJson.data);
        } catch (err) {
            console.error("Failed to fetch dropdowns:", err);
        }
    };

    const handleFormChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;
        const valLower = value.toLowerCase();

        if (
            name === "remarks" &&
            (valLower.includes("completed") || valLower.includes("done") || valLower.includes("resolved"))
        ) {
            setForm((prev) => ({
                ...prev,
                remarks: value,
                completionDate: prev.completionDate || new Date().toISOString().split("T")[0],
            }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(
                `${API_URL}/complaints/update-complaint/${form.complaintNo || complaintNo}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                }
            );
            const json = await res.json();
            if (json.success) {
                toast.success("Complaint updated successfully! 🎉");
                onComplaintUpdated();
            } else {
                toast.error(json.message || "Failed to update complaint.");
            }
        } catch {
            toast.error("Network error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass =
        "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Update Complaint ({complaintNo})
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Modify complaint details and click Update
                    </p>
                </div>
                <button
                    onClick={onBack}
                    className="bg-white text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
                >
                    ← Back to Complaints
                </button>
            </div>

            {loadingComplaint ? (
                <div className="text-center py-20 text-gray-400 text-lg">
                    Loading complaint details...
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <h3 className="text-base font-semibold text-gray-900 mb-6">
                            📝 Complaint Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            <div>
                                <label className={labelClass}>Complaint No *</label>
                                <input
                                    type="text"
                                    name="complaintNo"
                                    value={form.complaintNo}
                                    onChange={handleFormChange}
                                    required
                                    disabled
                                    className={`${inputClass} bg-gray-100 text-gray-500 cursor-not-allowed`}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Date *</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={form.date}
                                    onChange={handleFormChange}
                                    required
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Location *</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={form.location}
                                    onChange={handleFormChange}
                                    required
                                    placeholder="e.g. Store Room"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Category *</label>
                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleFormChange}
                                    required
                                    className={inputClass}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.category}>
                                            {cat.category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Complained Person *</label>
                                <input
                                    type="text"
                                    name="complainedPerson"
                                    value={form.complainedPerson}
                                    onChange={handleFormChange}
                                    required
                                    placeholder="e.g. Ali"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Supervisor</label>
                                <input
                                    type="text"
                                    name="supervisor"
                                    value={form.supervisor}
                                    onChange={handleFormChange}
                                    placeholder="e.g. Ahmed"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Time Note</label>
                                <input
                                    type="text"
                                    name="timeNote"
                                    value={form.timeNote}
                                    onChange={handleFormChange}
                                    placeholder="e.g. 9:00"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Time Done</label>
                                <input
                                    type="text"
                                    name="timeDone"
                                    value={form.timeDone}
                                    onChange={handleFormChange}
                                    placeholder="e.g. 11:30"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Priority *</label>
                                <select
                                    name="priority"
                                    value={form.priority}
                                    onChange={handleFormChange}
                                    required
                                    className={inputClass}
                                >
                                    <option value="">Select Priority</option>
                                    {priorities.map((pri) => (
                                        <option key={pri.id} value={pri.priority}>
                                            {pri.priority}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-5">
                            <label className={labelClass}>Complaint Details *</label>
                            <textarea
                                name="complaintDetails"
                                value={form.complaintDetails}
                                onChange={handleFormChange}
                                required
                                rows={3}
                                placeholder="Describe the complaint..."
                                className={`${inputClass} resize-none`}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                            <div>
                                <label className={labelClass}>Status / Remarks</label>
                                <input
                                    type="text"
                                    name="remarks"
                                    value={form.remarks}
                                    onChange={handleFormChange}
                                    placeholder="e.g. Completed"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Completion Date</label>
                                <input
                                    type="date"
                                    name="completionDate"
                                    value={form.completionDate}
                                    onChange={handleFormChange}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Material Consumed</label>
                                <input
                                    type="text"
                                    name="materialConsumed"
                                    value={form.materialConsumed}
                                    onChange={handleFormChange}
                                    placeholder="e.g. 2 Paint Buckets"
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/35 hover:shadow-blue-500/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? "Updating..." : "Update Complaint"}
                            </button>
                            <button
                                type="button"
                                onClick={onBack}
                                className="bg-white text-gray-600 border border-gray-200 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </>
    );
}
