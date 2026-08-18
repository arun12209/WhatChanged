import React from 'react';
import {
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { BrandLogo } from '../../components/common/BrandLogo';
import { getClientConnectionStatus } from '../../data/salesforceClient';

export const AboutView: React.FC = () => {
  const conn = getClientConnectionStatus();

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-150 pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <BrandLogo size="lg" variant="glass" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">WhatChanged</h1>
            <p className="text-xs text-sky-100 font-medium">
              Salesforce Change Intelligence &amp; Observability Platform
            </p>
          </div>
        </div>
        <p className="text-sm text-sky-100 max-w-2xl mt-3 leading-relaxed">
          Transforms raw, cryptic Salesforce Setup Audit Trail logs into an executive-grade,
          searchable, human-friendly engineering dashboard.
        </p>
      </div>

      {/* Org Connection & Diagnostic Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <Card className="p-4">
          <span className="text-slate-400 block mb-1">Architecture Target</span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Multi-Framework React (UIBundle)
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-slate-400 block mb-1">Runtime Status</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={`w-2 h-2 rounded-full ${
                conn.isLive ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {conn.environmentLabel}
            </span>
          </div>
        </Card>

        <Card className="p-4">
          <span className="text-slate-400 block mb-1">Salesforce API Version</span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
            v66.0 (Spring '26 / Current GA)
          </span>
        </Card>
      </div>

      {/* Security Model Explanation */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Security &amp; Authorization Model
          </h2>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          WhatChanged enforces strict server-side access controls before querying or exposing
          Salesforce change history:
        </p>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-sky-500 mt-1 flex-shrink-0" />
            <div>
              <strong className="text-slate-900 dark:text-slate-100">
                Custom Permission:
              </strong>{' '}
              <code className="text-sky-600 dark:text-sky-400">WhatChanged_Access</code> governs
              access to the application and REST endpoints.
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-purple-500 mt-1 flex-shrink-0" />
            <div>
              <strong className="text-slate-900 dark:text-slate-100">
                Permission Set:
              </strong>{' '}
              <code className="text-purple-600 dark:text-purple-400">WhatChanged_User</code> provides
              the custom permission and grants tab/application visibility.
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
            <div>
              <strong className="text-slate-900 dark:text-slate-100">Data Isolation:</strong> All
              audit computations happen securely within the Salesforce trust boundary without
              transmitting metadata to external endpoints.
            </div>
          </div>
        </div>
      </Card>

      {/* Normalization & Categorization */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="w-5 h-5 text-purple-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Event Normalization Pipeline
          </h2>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          The normalization engine translates low-level Setup Audit Trail rows into structured,
          human-readable titles and narrative explanations:
        </p>

        <div className="mt-4 p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs space-y-2">
          <div className="text-slate-500">// Raw Salesforce SetupAuditTrail Log</div>
          <div className="text-rose-400">
            "Changed field permissions in permission set C360 Account Manager: Account.AnnualRevenue edit permission granted"
          </div>
          <div className="text-slate-500 pt-1">// Normalized WhatChanged Observability Story</div>
          <div className="text-emerald-400">
            🔐 <strong>Permission Set updated:</strong> Updated field permissions for Account in C360 Account Manager permission set.
          </div>
        </div>
      </Card>
    </div>
  );
};
