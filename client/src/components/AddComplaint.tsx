import { useState, useEffect } from "react";

const API_URL = "http://localhost:5000/api";

interface CategoryItem {
    id: string;
    category: string;
}

interface PriorityItem {
    id: string;
    priority: string;
}

interface AddComplaintProps {
    onBack: () => void;
    onComplaintAdded: () => void;
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
};

export default function AddComplaint({ onBack, onComplaintAdded }: AddComplaintProps) {
    const [form, setForm] = useState({ ...emptyForm });
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [priorities, setPriorities] = useState<PriorityItem[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitMsg, setSubmitMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        fetchDropdowns();
    }, []);

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
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitMsg(null);
        try {
            const res = await fetch(`${API_URL}/complaints/add-complaint`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const json = await res.json();
            if (json.success) {
                setSubmitMsg({ type: "success", text: "Complaint added successfully!" });
                setForm({ ...emptyForm, date: new Date().toISOString().split("T")[0] });
                onComplaintAdded();
            } else {
                setSubmitMsg({ type: "error", text: json.message || "Failed to add complaint." });
            }
        } catch {
            setSubmitMsg({ type: "error", text: "Network error. Please try again." });
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
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Add New Complaint</h2>
                    <p className="text-sm text-gray-500 mt-1">Fill in the details to register a new complaint</p>
                </div>
                <button
                    onClick={onBack}
                    className="bg-white text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
                >
                    ← Back to Dashboard
                </button>
            </div>

            {submitMsg && (
                <div
                    className={`mb-6 px-5 py-3 rounded-xl text-sm font-medium ${submitMsg.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                >
                    {submitMsg.type === "success" ? "✅" : "❌"} {submitMsg.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-base font-semibold text-gray-900 mb-6">📝 Complaint Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div>
                            <label className={labelClass}>Complaint No *</label>
                            <input type="text" name="complaintNo" value={form.complaintNo} onChange={handleFormChange} required placeholder="e.g. CMP-002" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Date *</label>
                            <input type="date" name="date" value={form.date} onChange={handleFormChange} required className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Type of Work/Location *</label>
                            <input type="text" name="location" value={form.location} onChange={handleFormChange} required placeholder="e.g. Store Room" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Category *</label>
                            <select name="category" value={form.category} onChange={handleFormChange} required className={inputClass}>
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.category}>{cat.category}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Complained Person *</label>
                            <input type="text" name="complainedPerson" value={form.complainedPerson} onChange={handleFormChange} required placeholder="e.g. Ali" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Supervisor</label>
                            <input type="text" name="supervisor" value={form.supervisor} onChange={handleFormChange} placeholder="e.g. Ahmed" className={inputClass} />
                        </div>
                        {/* Complaint Attended By (Dropdown) */}
                        <div>
                            <label className={labelClass}>Complaint Attended By</label>
                            <select
                                name="attendedBy"
                                value={form.attendedBy}
                                onChange={handleFormChange}
                                className={inputClass}
                            >
                                <option value="">Select Trade/Role</option>
                                <option value="Painter">Painter</option>
                                <option value="Welder">Welder</option>
                                <option value="Plumber">Plumber</option>
                                <option value="Electrician">Electrician</option>
                                <option value="Carpenter">Carpenter</option>
                                <option value="Mason">Mason</option>
                                <option value="Helper">Helper</option>
                            </select>
                        </div>

                        {/* Number of Workers (Count) */}
                        <div>
                            <label className={labelClass}>Number of Workers</label>
                            <input
                                type="number"
                                name="numberOfWorkers"
                                min="1"
                                value={form.numberOfWorkers}
                                onChange={handleFormChange}
                                placeholder="e.g. 2"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Time Note</label>
                            <input type="text" name="timeNote" value={form.timeNote} onChange={handleFormChange} placeholder="e.g. 9:00" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Time Done</label>
                            <input type="text" name="timeDone" value={form.timeDone} onChange={handleFormChange} placeholder="e.g. 11:30" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Priority *</label>
                            <select name="priority" value={form.priority} onChange={handleFormChange} required className={inputClass}>
                                <option value="">Select Priority</option>
                                {priorities.map((pri) => (
                                    <option key={pri.id} value={pri.priority}>{pri.priority}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-5">
                        <label className={labelClass}>Complaint Details *</label>
                        <textarea name="complaintDetails" value={form.complaintDetails} onChange={handleFormChange} required rows={3} placeholder="Describe the complaint..." className={`${inputClass} resize-none`} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                        <div>
                            <label className={labelClass}>Status</label>
                            <input type="text" name="remarks" value={form.remarks} onChange={handleFormChange} placeholder="e.g. Completed" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Material Consumed</label>
                            <input type="text" name="materialConsumed" value={form.materialConsumed} onChange={handleFormChange} placeholder="e.g. 2 Paint Buckets" className={inputClass} />
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/35 hover:shadow-blue-500/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Submitting..." : "Submit Complaint"}
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
        </>
    );
}
