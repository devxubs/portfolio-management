import React, { useEffect, useState } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Copy, 
  Check, 
  ShieldAlert, 
  ExternalLink,
  Table,
  Layers
} from 'lucide-react';

interface SupabaseStatusResponse {
  configured?: boolean;
  connected?: boolean;
  table?: string;
  key_type?: string;
  row_count?: number;
  data?: any[];
  error?: string;
  code?: string;
  details?: string;
  hint?: string;
  message?: string;
  has_url?: boolean;
  has_key?: boolean;
  note?: string;
}

interface SupabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshProjects: () => void;
}

export const SupabaseStatusModal: React.FC<SupabaseStatusModalProps> = ({
  isOpen,
  onClose,
  onRefreshProjects,
}) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<SupabaseStatusResponse | null>(null);
  const [copiedSql, setCopiedSql] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/supabase/status');
      const data = await res.json();
      setStatus(data);
    } catch (err: any) {
      setStatus({
        configured: false,
        connected: false,
        error: err.message || 'Failed to connect to backend server',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSql(id);
    setTimeout(() => setCopiedSql(null), 2000);
  };

  const disableRlsSql = `ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;`;
  const enableRlsPolicySql = `ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public full access" 
ON public.projects 
FOR ALL 
TO anon, authenticated, service_role 
USING (true) 
WITH CHECK (true);`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                Supabase Connection & Table Diagnostic
              </h2>
              <p className="text-xs text-zinc-400">
                Live inspection of your Supabase database, RLS permissions, and row counts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 rounded-lg transition-colors text-xs font-mono"
          >
            ✕ Close
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Quick Status Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-zinc-950/70 border border-zinc-800 rounded-xl">
              <span className="text-[11px] font-mono uppercase text-zinc-500 block mb-1">Status</span>
              <div className="flex items-center gap-2">
                {loading ? (
                  <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Checking...
                  </span>
                ) : status?.connected ? (
                  <span className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Connected
                  </span>
                ) : (
                  <span className="text-xs font-medium text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> In-Memory Mode
                  </span>
                )}
              </div>
            </div>

            <div className="p-3.5 bg-zinc-950/70 border border-zinc-800 rounded-xl">
              <span className="text-[11px] font-mono uppercase text-zinc-500 block mb-1">Rows in Supabase</span>
              <div className="flex items-center gap-2 font-mono">
                <Table className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-base font-bold text-zinc-200">
                  {status?.row_count !== undefined ? status.row_count : '0'}
                </span>
                <span className="text-[11px] text-zinc-500">projects</span>
              </div>
            </div>

            <div className="p-3.5 bg-zinc-950/70 border border-zinc-800 rounded-xl">
              <span className="text-[11px] font-mono uppercase text-zinc-500 block mb-1">API Key Mode</span>
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                  status?.key_type === 'service_role' 
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {status?.key_type || 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* Diagnostic Result */}
          {status?.connected && status.row_count !== undefined && status.row_count > 0 && (
            <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-emerald-300 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-xs sm:text-sm">
                  Supabase Table Connected Successfully!
                </p>
                <p className="text-xs text-emerald-300/80 mt-1">
                  Supabase-এ মোট <strong className="text-white">{status.row_count}</strong> টি রো পাওয়া গেছে। অ্যাপ্লিকেশনে ডেটা রিফ্রেশ করতে নিচের রিফ্রেশ বাটনে ক্লিক করুন।
                </p>
                {status.data && status.data.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-emerald-800/30">
                    <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block mb-1.5">
                      Found Rows in `public.projects`:
                    </span>
                    <ul className="text-xs space-y-1 text-zinc-300 font-mono">
                      {status.data.slice(0, 5).map((item: any, idx: number) => (
                        <li key={item.id || idx} className="truncate">
                          • {item.title || 'Untitled'} <span className="text-zinc-500 text-[10px]">({item.id})</span>
                        </li>
                      ))}
                      {status.data.length > 5 && (
                        <li className="text-zinc-400 italic text-[11px]">
                          + {status.data.length - 5} more items...
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Issue Explanation if not connected or error */}
          {(!status?.connected || status?.error) && (
            <div className="p-4 bg-amber-950/30 border border-amber-800/40 rounded-xl text-amber-200 space-y-3">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-xs sm:text-sm text-amber-300">
                    কেন Supabase থেকে ডেটা আসছে না বা ডিলিট হচ্ছে না?
                  </p>
                  <p className="text-xs text-amber-200/80 mt-1">
                    {status?.error 
                      ? `Supabase Error: ${status.error}`
                      : status?.message || 'Supabase credentials are not yet active or RLS is restricting access.'}
                  </p>
                </div>
              </div>

              {/* RLS Fix Queries */}
              <div className="mt-3 space-y-3 pt-3 border-t border-amber-800/30 text-xs">
                <p className="text-zinc-300 font-medium">
                  🛠️ সমাধান: Supabase SQL Editor-এ নিচের কমান্ডটি চালান:
                </p>

                {/* SQL Box 1 */}
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 font-mono text-xs text-zinc-300 relative group">
                  <div className="flex items-center justify-between mb-1.5 text-zinc-500 text-[11px]">
                    <span>Option 1: Disable RLS (সবচেয়ে সহজ)</span>
                    <button
                      onClick={() => copyToClipboard(disableRlsSql, 'opt1')}
                      className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      {copiedSql === 'opt1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedSql === 'opt1' ? 'Copied!' : 'Copy SQL'}
                    </button>
                  </div>
                  <pre className="text-emerald-400 overflow-x-auto selection:bg-indigo-900">{disableRlsSql}</pre>
                </div>

                {/* SQL Box 2 */}
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 font-mono text-xs text-zinc-300 relative group">
                  <div className="flex items-center justify-between mb-1.5 text-zinc-500 text-[11px]">
                    <span>Option 2: Grant Full Access Policy</span>
                    <button
                      onClick={() => copyToClipboard(enableRlsPolicySql, 'opt2')}
                      className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      {copiedSql === 'opt2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedSql === 'opt2' ? 'Copied!' : 'Copy SQL'}
                    </button>
                  </div>
                  <pre className="text-emerald-400 overflow-x-auto whitespace-pre-wrap selection:bg-indigo-900">{enableRlsPolicySql}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Re-test Connection
            </button>
            <button
              onClick={() => {
                onRefreshProjects();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-sm shadow-indigo-600/30"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Fetch & Sync All Projects
            </button>
          </div>
          
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
