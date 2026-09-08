export interface Complaint {
    complaintNo: string;
    date: string;
    location: string;
    category: string;
    complainedPerson: string;
    complaintDetails: string;
    timeNote: string;
    timeDone: string;
    supervisor: string;
    priority: string;
    status?: string;
    remarks: string;
    materialConsumed: string;
    attendedBy?: string;
    numberOfWorkers?: number;
    completionDate?: string;
}
