import React, { useState } from 'react';
import { Database, CheckCircle2, Copy, Check, Terminal, ExternalLink, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFineTrack } from '@/context/FineTrackContext';
import { Modal } from './Modal';

export const SupabaseBanner: React.FC = () => {
  const { isSupabaseConfigured } = useAuth();
  const { realtimeStatus } = useFineTrack();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const envSample = `# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...`;

  const copyEnv = () => {
    navigator.clipboard.writeText(envSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">FineTrack Live</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300">
              {isSupabaseConfigured ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Supabase Database & Realtime Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-amber-300 font-medium">
                  <Database className="w-3.5 h-3.5" />
                  Interactive Test Mode (Full CRUD & duplicate checks enabled)
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-slate-400">
              Admin Login: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-200">fine@gmail.com</code> / <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-200">fine@sof.admn</code>
            </span>
            <button
              onClick={() => setShowGuideModal(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <Terminal className="w-3 h-3 text-sky-400" />
              <span>Supabase Setup SQL</span>
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        title="Supabase Database & Auth Setup"
        description="Follow these steps to connect your own Supabase project in 2 minutes."
        maxWidth="lg"
      >
        <div className="space-y-4 text-sm text-slate-600">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono">
            <div className="flex justify-between items-center mb-1 text-slate-400">
              <span>Environment Variables (.env.local)</span>
              <button
                onClick={copyEnv}
                className="flex items-center gap-1 text-sky-600 hover:text-sky-700 font-sans"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="text-slate-800 overflow-x-auto whitespace-pre">{envSample}</pre>
          </div>

          <div className="space-y-2">
            <h5 className="font-semibold text-slate-900 text-sm">Quick Setup Steps:</h5>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-xs leading-relaxed">
              <li>
                Create a project at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-sky-600 underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-2.5 h-2.5" /></a>.
              </li>
              <li>
                Open the Supabase <strong>SQL Editor</strong> and run the contents of <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">supabase/schema.sql</code>.
              </li>
              <li>
                Go to <strong>Authentication &gt; Users &gt; Add User</strong> with:
                <br />Email: <code className="text-slate-900 font-semibold">fine@gmail.com</code>
                <br />Password: <code className="text-slate-900 font-semibold">fine@sof.admn</code>
                <br />(Or run <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">supabase/admin_setup.sql</code> in SQL Editor).
              </li>
              <li>
                In Supabase <strong>Project Settings &gt; API</strong>, copy the Project URL and anon key into <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">.env.local</code>.
              </li>
            </ol>
          </div>

          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>RLS policies and Supabase Realtime publication are already bundled in the schema!</span>
          </div>
        </div>
      </Modal>
    </>
  );
};
