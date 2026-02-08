
import React from 'react';
import { AnalysisResult } from '../types';
import { Brain, Eye, Lightbulb, ClipboardList, CheckCircle2, Zap, Link } from 'lucide-react';

interface ThinkingProcessProps {
  analysis: AnalysisResult | null;
  loading: boolean;
}

export const ThinkingProcess: React.FC<ThinkingProcessProps> = ({ analysis, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-emerald-500 animate-spin" />
          <h3 className="text-lg font-semibold text-emerald-900">Orchestrating Growth Models...</h3>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-100 rounded w-3/4"></div>
          <div className="h-4 bg-slate-100 rounded w-1/2"></div>
          <div className="h-4 bg-slate-100 rounded w-5/6"></div>
          <p className="text-xs text-slate-400 mt-2 italic">Querying botanical research models and comparison benchmarks...</p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const steps = [
    {
      title: 'Observation',
      icon: <Eye className="w-5 h-5 text-blue-500" />,
      content: analysis.level1_observation,
      color: 'bg-blue-50 border-blue-100'
    },
    {
      title: 'Hypothesis',
      icon: <Lightbulb className="w-5 h-5 text-amber-500" />,
      content: analysis.level2_hypothesis,
      color: 'bg-amber-50 border-amber-100'
    },
    {
      title: 'Action Plan',
      icon: <ClipboardList className="w-5 h-5 text-emerald-500" />,
      content: analysis.level3_plan,
      color: 'bg-emerald-50 border-emerald-100'
    },
    {
      title: 'Verification',
      icon: <CheckCircle2 className="w-5 h-5 text-purple-500" />,
      content: analysis.level4_verification,
      color: 'bg-purple-50 border-purple-100'
    },
    {
      title: 'Comparative Analysis',
      icon: <Zap className="w-5 h-5 text-indigo-500" />,
      content: analysis.level5_comparative_analysis,
      color: 'bg-indigo-50 border-indigo-100'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-800">Orchestrator Reasoning Engine</h3>
        </div>
        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-tighter">
          5-Level Deep Process
        </span>
      </div>
      <div className="p-6 space-y-4">
        {steps.map((step, idx) => (
          <div key={idx} className={`p-4 rounded-lg border ${step.color}`}>
            <div className="flex items-center gap-2 mb-2 font-medium text-slate-700">
              {step.icon}
              <span className="text-sm">L{idx + 1}: {step.title}</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed pl-7">
              {step.content}
            </p>
          </div>
        ))}

        {analysis.sources && analysis.sources.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2 flex items-center gap-1.5">
              <Link className="w-3 h-3" /> External Reference Sources
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.sources.map((source, i) => (
                <a 
                  key={i} 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded transition-colors truncate max-w-[200px]"
                  title={source.title}
                >
                  {source.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
