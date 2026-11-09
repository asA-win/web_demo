import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Mail, Phone, Clock, Check, 
  Trash2, RefreshCw, X, AlertCircle, Send, CheckCheck 
} from 'lucide-react';
import { enquiryService } from '../../services/api';
import { useWebSocket } from '../../context/WebSocketContext';
import { useToast } from '../../components/Toast';

export const EnquiriesManager = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Detail / Reply Modal
  const [activeEnquiry, setActiveEnquiry] = useState(null);
  const [adminReply, setAdminReply] = useState('');
  const [replyStatus, setReplyStatus] = useState('replied');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { subscribe } = useWebSocket();
  const { addToast } = useToast();

  const fetchEnquiries = async () => {
    try {
      setIsLoading(true);
      const data = await enquiryService.adminGetEnquiries(statusFilter || null);
      setEnquiries(data);
    } catch (err) {
      console.error('Failed to load enquiries:', err);
      addToast('Error loading enquiries.', 'error', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();

    // Subscribe to new incoming enquiries live!
    const unsub = subscribe('NEW_ENQUIRY', () => {
      fetchEnquiries();
    });

    return () => unsub();
  }, [statusFilter]);

  const openEnquiry = (enq) => {
    setActiveEnquiry(enq);
    setAdminReply(enq.admin_reply || '');
    setReplyStatus(enq.status === 'pending' ? 'replied' : enq.status);

    // If pending, mark as read automatically
    if (enq.status === 'pending') {
      enquiryService.adminUpdateEnquiry(enq.id, { status: 'read' })
        .then(() => {
          setEnquiries((prev) => prev.map((e) => e.id === enq.id ? { ...e, status: 'read' } : e));
        })
        .catch(console.error);
    }
  };

  const handleSaveReply = async (e) => {
    e.preventDefault();
    if (!activeEnquiry) return;

    setIsSubmitting(true);
    try {
      await enquiryService.adminUpdateEnquiry(activeEnquiry.id, {
        status: replyStatus,
        admin_reply: adminReply || null,
      });

      addToast(`Enquiry from ${activeEnquiry.customer_name} updated.`, 'success', 'Saved');
      setActiveEnquiry(null);
      fetchEnquiries();
    } catch (err) {
      console.error('Reply failed:', err);
      addToast('Failed to update enquiry.', 'error', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete enquiry from ${name}?`)) return;
    try {
      await enquiryService.adminDeleteEnquiry(id);
      addToast('Enquiry removed.', 'info', 'Deleted');
      fetchEnquiries();
    } catch (err) {
      console.error('Delete enquiry failed:', err);
      addToast('Failed to delete enquiry.', 'error', 'Error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white uppercase tracking-wide">
            Customer Inquiries & Concierge
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Incoming guest messages, private dining requests, and VIP buyout communications.
          </p>
        </div>

        <button
          onClick={() => fetchEnquiries()}
          className="btn-outline-gold text-xs font-semibold py-2 px-4 flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="glass-panel p-3 rounded-xl border border-gold-400/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {['', 'pending', 'read', 'replied'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                statusFilter === st
                  ? 'bg-gold-400 text-obsidian-950 font-bold'
                  : 'text-slate-400 hover:text-white bg-obsidian-900 border border-slate-800'
              }`}
            >
              {st === '' ? 'All Enquiries' : st}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-mono hidden sm:block">
          Total: {enquiries.length} Messages
        </span>
      </div>

      {/* Enquiries List */}
      <div className="glass-panel rounded-2xl border border-gold-400/20 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-obsidian-900 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Guest</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Message Snippet</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading messages...
                  </td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    No customer enquiries found in this category.
                  </td>
                </tr>
              ) : (
                enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-obsidian-850/60 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(enq.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5 whitespace-nowrap">
                      <div className="font-semibold text-white">{enq.customer_name}</div>
                      <div className="text-[11px] text-slate-400">{enq.customer_email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gold-300">
                      {enq.subject || 'General'}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-slate-300 truncate">
                      {enq.message}
                    </td>
                    <td className="py-3.5 px-4">
                      {enq.status === 'pending' && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-950 border border-amber-500/40 text-amber-300 font-semibold text-[10px] uppercase">
                          New
                        </span>
                      )}
                      {enq.status === 'read' && (
                        <span className="px-2.5 py-1 rounded-full bg-sky-950 border border-sky-500/40 text-sky-300 font-semibold text-[10px] uppercase">
                          Read
                        </span>
                      )}
                      {enq.status === 'replied' && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-semibold text-[10px] uppercase">
                          Replied
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEnquiry(enq)}
                        className="px-3 py-1.5 rounded-lg bg-obsidian-800 border border-slate-700 text-gold-300 hover:text-white text-xs font-semibold"
                      >
                        Open Details
                      </button>
                      <button
                        onClick={() => handleDelete(enq.id, enq.customer_name)}
                        className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-300 hover:bg-rose-900 inline-block"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail / Reply Modal */}
      {activeEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-gold-400/40 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider">
                  Guest Enquiry
                </h3>
                <span className="text-xs text-gold-300">{activeEnquiry.subject}</span>
              </div>
              <button
                onClick={() => setActiveEnquiry(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-obsidian-900/80 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block uppercase">Guest Name</span>
                  <span className="text-white font-medium">{activeEnquiry.customer_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase">Email</span>
                  <a href={`mailto:${activeEnquiry.customer_email}`} className="text-gold-300 hover:underline">
                    {activeEnquiry.customer_email}
                  </a>
                </div>
                {activeEnquiry.customer_phone && (
                  <div>
                    <span className="text-slate-500 block uppercase">Phone</span>
                    <a href={`tel:${activeEnquiry.customer_phone}`} className="text-slate-200">
                      {activeEnquiry.customer_phone}
                    </a>
                  </div>
                )}
                <div>
                  <span className="text-slate-500 block uppercase">Received</span>
                  <span className="text-slate-300">{new Date(activeEnquiry.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 uppercase font-semibold block">Customer Message:</span>
                <div className="p-3 bg-obsidian-900 rounded-xl border border-slate-800 text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {activeEnquiry.message}
                </div>
              </div>

              <form onSubmit={handleSaveReply} className="space-y-3 pt-2 border-t border-slate-800">
                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wider text-slate-300">
                    Status
                  </label>
                  <select
                    value={replyStatus}
                    onChange={(e) => setReplyStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-400"
                  >
                    <option value="pending">Pending</option>
                    <option value="read">Marked as Read</option>
                    <option value="replied">Replied to Guest</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wider text-slate-300">
                    Internal Reply Record / Notes
                  </label>
                  <textarea
                    rows="3"
                    value={adminReply}
                    onChange={(e) => setAdminReply(e.target.value)}
                    placeholder="Record notes on telephone discussion or emailed response..."
                    className="w-full px-3 py-2 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-400 resize-none"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setActiveEnquiry(null)}
                    className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-gold py-2 px-5 font-bold uppercase tracking-wider"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Enquiry Status'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
