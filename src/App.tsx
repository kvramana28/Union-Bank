/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Mail, 
  MessageSquare, 
  Twitter, 
  Smartphone, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  User, 
  ChevronRight, 
  Filter, 
  MoreVertical,
  ArrowLeft,
  ShieldAlert,
  CreditCard,
  FileText,
  History,
  ExternalLink,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type Source = 'Twitter' | 'SMS' | 'Email' | 'WhatsApp';
type Category = 'UPI' | 'Loans' | 'KYC' | 'Fraud' | 'General';
type Status = 'Logged' | 'Assigned' | 'In-Progress' | 'Resolved';
type Sentiment = 'Urgent' | 'Neutral' | 'Positive';

interface Complaint {
  id: string;
  customerName: string;
  customerId: string;
  source: Source;
  category: Category;
  sentiment: Sentiment;
  status: Status;
  subject: string;
  description: string;
  timestamp: string;
  history: {
    date: string;
    action: string;
    source: Source;
  }[];
}

// --- Mock Data ---
const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: "CMP-1001",
    customerName: "Rajesh Kumar",
    customerId: "CIF-88291",
    source: "Twitter",
    category: "Fraud",
    sentiment: "Urgent",
    status: "Logged",
    subject: "Unauthorized transaction of ₹50,000",
    description: "I received an OTP for a transaction I didn't initiate. Now ₹50,000 is debited from my account. Please block my card immediately!",
    timestamp: "10 mins ago",
    history: [
      { date: "2026-03-25", action: "Account Balance Inquiry", source: "SMS" },
      { date: "2026-03-20", action: "Address Change Request", source: "Email" },
      { date: "2026-03-15", action: "ATM Withdrawal", source: "SMS" }
    ]
  },
  {
    id: "CMP-1002",
    customerName: "Priya Sharma",
    customerId: "CIF-77120",
    source: "WhatsApp",
    category: "UPI",
    sentiment: "Urgent",
    status: "Assigned",
    subject: "UPI Payment Failed but Amount Debited",
    description: "Tried to pay at a grocery store using BHIM UPI. Transaction failed but money was deducted from my savings account. Transaction ID: 66291002.",
    timestamp: "45 mins ago",
    history: [
      { date: "2026-03-26", action: "UPI Transaction - Success", source: "WhatsApp" },
      { date: "2026-03-24", action: "Mobile Recharge", source: "SMS" }
    ]
  },
  {
    id: "CMP-1003",
    customerName: "Amit Patel",
    customerId: "CIF-99301",
    source: "Email",
    category: "Loans",
    sentiment: "Neutral",
    status: "In-Progress",
    subject: "Home Loan Interest Rate Clarification",
    description: "I wanted to understand why the floating interest rate on my home loan (HL-5521) has increased this quarter despite no repo rate change.",
    timestamp: "2 hours ago",
    history: [
      { date: "2026-02-10", action: "Home Loan Disbursal", source: "Email" },
      { date: "2026-01-15", action: "KYC Document Submission", source: "Email" }
    ]
  },
  {
    id: "CMP-1004",
    customerName: "Sunita Devi",
    customerId: "CIF-11203",
    source: "SMS",
    category: "KYC",
    sentiment: "Neutral",
    status: "Logged",
    subject: "KYC Update Pending for 2 Weeks",
    description: "I submitted my Re-KYC documents at the branch 14 days ago but I'm still getting messages that my account will be frozen. Please update.",
    timestamp: "5 hours ago",
    history: [
      { date: "2026-03-10", action: "Branch Visit - KYC", source: "SMS" }
    ]
  },
  {
    id: "CMP-1005",
    customerName: "Vikram Singh",
    customerId: "CIF-44512",
    source: "Twitter",
    category: "General",
    sentiment: "Positive",
    status: "Resolved",
    subject: "Appreciation for Branch Manager",
    description: "The manager at the Connaught Place branch was extremely helpful in resolving my pension-related issues. Great service!",
    timestamp: "1 day ago",
    history: [
      { date: "2026-03-20", action: "Pension Credit Inquiry", source: "Twitter" }
    ]
  }
];

// --- Components ---

const StatusProgressBar = ({ currentStatus }: { currentStatus: Status }) => {
  const steps: Status[] = ['Logged', 'Assigned', 'In-Progress', 'Resolved'];
  const currentIndex = steps.indexOf(currentStatus);

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
        <div 
          className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        ></div>
        
        {steps.map((step, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={step} className="flex flex-col items-center relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                isActive ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-400'
              } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}>
                {isActive && index < currentIndex ? <CheckCircle2 size={16} /> : <span>{index + 1}</span>}
              </div>
              <span className={`mt-2 text-xs font-semibold ${isActive ? 'text-blue-700' : 'text-gray-500'}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SourceIcon = ({ source, size = 18 }: { source: Source, size?: number }) => {
  switch (source) {
    case 'Twitter': return <Twitter size={size} className="text-sky-500" />;
    case 'SMS': return <Smartphone size={size} className="text-emerald-500" />;
    case 'Email': return <Mail size={size} className="text-indigo-500" />;
    case 'WhatsApp': return <MessageSquare size={size} className="text-green-500" />;
  }
};

const SentimentBadge = ({ sentiment }: { sentiment: Sentiment }) => {
  const styles = {
    Urgent: "bg-red-100 text-red-700 border-red-200",
    Neutral: "bg-blue-100 text-blue-700 border-blue-200",
    Positive: "bg-green-100 text-green-700 border-green-200"
  };
  
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[sentiment]}`}>
      {sentiment}
    </span>
  );
};

export default function App() {
  const [selectedId, setSelectedId] = useState<string>(MOCK_COMPLAINTS[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  
  const selectedComplaint = useMemo(() => 
    MOCK_COMPLAINTS.find(c => c.id === selectedId) || MOCK_COMPLAINTS[0]
  , [selectedId]);

  const filteredComplaints = MOCK_COMPLAINTS.filter(c => 
    c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900">
      {/* Sidebar - Omnichannel Inbox */}
      <div className="w-80 border-r border-slate-200 bg-white flex flex-col shadow-sm">
        <div className="p-6 border-bottom border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center text-white">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-blue-900 leading-tight">Public Bank</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Unified Dashboard</p>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search complaints..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-6">
          <div className="flex items-center justify-between px-3 py-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inbox</h2>
            <Filter size={14} className="text-slate-400 cursor-pointer hover:text-blue-600" />
          </div>
          
          <div className="space-y-1">
            {filteredComplaints.map((complaint) => (
              <button
                key={complaint.id}
                onClick={() => setSelectedId(complaint.id)}
                className={`w-full text-left p-3 rounded-xl transition-all group ${
                  selectedId === complaint.id 
                    ? 'bg-blue-50 border-l-4 border-blue-600 shadow-sm' 
                    : 'hover:bg-slate-50 border-l-4 border-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <SourceIcon source={complaint.source} size={14} />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{complaint.source}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{complaint.timestamp}</span>
                </div>
                <h3 className={`text-sm font-bold truncate ${selectedId === complaint.id ? 'text-blue-900' : 'text-slate-700'}`}>
                  {complaint.subject}
                </h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-500">{complaint.customerName}</span>
                  <SentimentBadge sentiment={complaint.sentiment} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Customer 360 & Triage */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-slate-400">Ticket: {selectedComplaint.id}</span>
            <div className="h-4 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Category:</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold uppercase">{selectedComplaint.category}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900">Officer Venkat</p>
                <p className="text-[10px] text-slate-500">Nodal Officer</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">
                VK
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Top Section: Status & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock size={16} className="text-blue-600" />
                    Resolution Progress
                  </h2>
                  <span className="text-xs font-medium text-slate-500">Last updated: Just now</span>
                </div>
                <StatusProgressBar currentStatus={selectedComplaint.status} />
              </div>
              
              <div className="bg-blue-900 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between">
                <div>
                  <h2 className="text-sm font-bold opacity-80 mb-4">AI Triage Summary</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs opacity-70">Sentiment</span>
                      <SentimentBadge sentiment={selectedComplaint.sentiment} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs opacity-70">Urgency Level</span>
                      <span className={`text-xs font-bold ${selectedComplaint.sentiment === 'Urgent' ? 'text-red-400' : 'text-blue-300'}`}>
                        {selectedComplaint.sentiment === 'Urgent' ? 'High Priority' : 'Standard'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs opacity-70">Auto-Route</span>
                      <span className="text-xs font-bold text-blue-300">{selectedComplaint.category} Desk</span>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                  Re-classify Category <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Middle Section: Complaint Details & Customer 360 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Complaint Detail */}
              <div className="lg:col-span-2 space-y-6">
                <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-2">{selectedComplaint.subject}</h2>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <SourceIcon source={selectedComplaint.source} size={14} />
                          <span>Received via {selectedComplaint.source}</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500">{selectedComplaint.timestamp}</span>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                  
                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-xl border border-slate-100 italic">
                      "{selectedComplaint.description}"
                    </p>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200 transition-all flex items-center gap-2">
                      <MessageSquare size={16} /> Reply to Customer
                    </button>
                    <button className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-all">
                      Internal Note
                    </button>
                    <button className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-all">
                      Escalate
                    </button>
                  </div>
                </section>

                {/* Internal Timeline */}
                <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                  <h2 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <History size={16} className="text-blue-600" />
                    Case Timeline
                  </h2>
                  <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                    <div className="flex gap-4 relative">
                      <div className="w-6 h-6 rounded-full bg-blue-600 border-4 border-white shadow-sm z-10"></div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Complaint Logged</p>
                        <p className="text-[10px] text-slate-500">System Auto-Triage • {selectedComplaint.timestamp}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 relative">
                      <div className="w-6 h-6 rounded-full bg-slate-200 border-4 border-white shadow-sm z-10"></div>
                      <div>
                        <p className="text-xs font-bold text-slate-400">Assigned to Nodal Officer</p>
                        <p className="text-[10px] text-slate-400">Pending Action</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Customer 360 View */}
              <div className="space-y-6">
                <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <User size={16} className="text-blue-600" />
                      Customer 360
                    </h2>
                    <button className="text-[10px] font-bold text-blue-600 uppercase hover:underline flex items-center gap-1">
                      Full Profile <ExternalLink size={10} />
                    </button>
                  </div>

                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3 border-2 border-white shadow-sm">
                      <User size={32} />
                    </div>
                    <h3 className="font-bold text-slate-900">{selectedComplaint.customerName}</h3>
                    <p className="text-xs text-slate-500">ID: {selectedComplaint.customerId}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Account Type</p>
                      <p className="text-xs font-bold text-slate-700">Savings Gold</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Branch</p>
                      <p className="text-xs font-bold text-slate-700">Main Branch</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recent Interactions</h4>
                    <div className="space-y-3">
                      {selectedComplaint.history.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 group">
                          <div className="mt-1">
                            <SourceIcon source={item.source} size={12} />
                          </div>
                          <div className="flex-1 border-b border-slate-50 pb-2 group-last:border-0">
                            <p className="text-xs font-bold text-slate-700">{item.action}</p>
                            <p className="text-[10px] text-slate-500">{item.date} • via {item.source}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-slate-500">Duplicate Check</span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase">No Duplicates</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Risk Score</span>
                      <div className="flex items-center gap-1">
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="w-1/3 h-full bg-green-500"></div>
                        </div>
                        <span className="text-[10px] font-bold text-green-600">Low</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Quick Documents */}
                <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <FileText size={16} className="text-blue-600" />
                    Related Artifacts
                  </h2>
                  <div className="space-y-2">
                    <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <CreditCard size={14} />
                        </div>
                        <span className="text-xs font-bold text-slate-700">Transaction Logs</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-300" />
                    </button>
                    <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <FileText size={14} />
                        </div>
                        <span className="text-xs font-bold text-slate-700">KYC Documents</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-300" />
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
