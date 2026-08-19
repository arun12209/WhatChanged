import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Layers,
  Sparkles,
  Zap,
  Cpu,
  Search,
  Command,
  BarChart3,
  Heart,
  Github,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { BrandLogo } from '../../components/common/BrandLogo';
import { CATEGORY_DEFINITIONS, ALL_CATEGORIES } from '../../domain/categories';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-150 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-sky-600 via-indigo-600 to-purple-700 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3.5">
            <BrandLogo size="lg" variant="glass" />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">WhatChanged</h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30">
                  v1.0.0 GA
                </span>
              </div>
              <p className="text-xs sm:text-sm text-sky-100 font-medium mt-0.5">
                Salesforce Change Intelligence &amp; Observability Platform
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-emerald-500/20 backdrop-blur-md text-emerald-100 border border-emerald-400/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Zero-Egress Trust Boundary
            </span>
          </div>
        </div>
        <p className="text-sm text-sky-100/90 max-w-2xl leading-relaxed">
          Transforms raw, cryptic Salesforce Setup Audit Trail logs into an executive-grade,
          searchable, human-friendly engineering dashboard with deterministic risk analysis and automated story clustering.
        </p>
      </div>

      {/* Core Platform Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-800/60 transition-colors">
          <div>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              100% In-Org Privacy
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              All audit calculations, story clustering, and baselines run natively inside your Salesforce Trust Boundary without egress to external servers.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Native Platform Security
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-800/60 transition-colors">
          <div>
            <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/50 flex items-center justify-center mb-3">
              <ShieldAlert className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Deterministic Risk Scoring
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Automatically categorizes raw setup codes into 11 domains and 5 severity risk tiers (Critical, High, Medium, Low, Info) for rapid impact analysis.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-medium text-purple-600 dark:text-purple-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 5-Tier Heuristic Engine
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between hover:border-sky-300 dark:hover:border-sky-800/60 transition-colors">
          <div>
            <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/50 flex items-center justify-center mb-3">
              <Layers className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Smart Story Clustering
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Aggregates multi-step configuration clicks made by the same engineer within temporal windows into clean, plain-English change narratives.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-medium text-sky-600 dark:text-sky-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Temporal Clustering
          </div>
        </Card>
      </div>

      {/* Comprehensive Domain Coverage Matrix */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Comprehensive Domain Coverage
            </h2>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            11 Domains Monitored
          </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          WhatChanged monitors and categorizes configuration changes across every core Salesforce administrative boundary:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {ALL_CATEGORIES.map((catKey) => {
            const cat = CATEGORY_DEFINITIONS[catKey];
            const Icon = cat.icon;
            return (
              <div
                key={catKey}
                className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex items-start gap-2.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 border"
                  style={{
                    backgroundColor: `${cat.dotColor}15`,
                    borderColor: `${cat.dotColor}35`,
                  }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: cat.dotColor }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {cat.label}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2 mt-0.5">
                    {cat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Power Features & Pro Tips */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Power Features &amp; Pro Tips
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              <Search className="w-4 h-4 text-sky-500" />
              <span>Incident Investigation Mode</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Click any event timestamp or activate Incident Mode to isolate modifications in a ±30 minute window for root-cause outage analysis.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              <Command className="w-4 h-4 text-purple-500" />
              <span>Global Command Palette</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Press <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded shadow-xs">⌘K</kbd> or <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded shadow-xs">/</kbd> anywhere to search events, switch views, or filter by user and category.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              <span>Dynamic Baselines</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Automatically benchmarks today's activity against historical weekday averages to surface anomaly patterns and velocity surges.
            </p>
          </div>
        </div>
      </Card>

      {/* Security Model Explanation */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
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
              <code className="px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-mono text-[11px]">
                WhatChanged_Access
              </code>{' '}
              governs access to the application and REST endpoints.
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-purple-500 mt-1 flex-shrink-0" />
            <div>
              <strong className="text-slate-900 dark:text-slate-100">
                Permission Set:
              </strong>{' '}
              <code className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-mono text-[11px]">
                WhatChanged_User
              </code>{' '}
              provides the custom permission and grants tab/application visibility.
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
          <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Event Normalization Pipeline
          </h2>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          The normalization engine translates low-level Setup Audit Trail rows into structured,
          human-readable titles and narrative explanations:
        </p>

        <div className="mt-4 p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs space-y-2 border border-slate-800 shadow-inner">
          <div className="text-slate-500 text-[11px]">// Raw Salesforce SetupAuditTrail Log</div>
          <div className="text-rose-400 bg-rose-950/30 p-2.5 rounded-lg border border-rose-900/40 leading-relaxed">
            "Changed field permissions in permission set C360 Account Manager: Account.AnnualRevenue edit permission granted"
          </div>
          <div className="text-slate-500 text-[11px] pt-1">// Normalized WhatChanged Observability Story</div>
          <div className="text-emerald-400 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-900/40 leading-relaxed">
            🔐 <strong>Permission Set updated:</strong> Updated field permissions for Account in C360 Account Manager permission set.
          </div>
        </div>
      </Card>

      {/* Developer & Project Attribution Card */}
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100/70 dark:from-slate-900/80 dark:to-slate-800/40 border-slate-200 dark:border-slate-800 overflow-hidden relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md shadow-sky-500/20 flex-shrink-0">
              AK
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex-wrap">
                <span>Developed with</span>
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500 inline-block animate-pulse" />
                <span>by</span>
                <a
                  href="https://www.linkedin.com/in/arun-kumar4/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:underline inline-flex items-center gap-1"
                >
                  <span>Arun Kumar</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Lead Software Engineer • Built for the Trailblazer Community
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="https://github.com/arun12209/WhatChanged"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white border border-slate-700/50 shadow-xs transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub Repo</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <span className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
              MIT License
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
