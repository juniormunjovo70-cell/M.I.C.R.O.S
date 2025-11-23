
import React, { useState, useRef, useEffect } from 'react';
import { 
  NodeType, Node, NodeData, Connection, ViewMode, NodeStatus, ReportData, Language, Project, MentorAdvice 
} from './types';
import { generateNodeInsights, generateFinalReport, generateMentorAdvice, checkApiKey } from './services/geminiService';

// --- Icons ---
const Icons = {
  Brain: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657C5.477 6.343 6.343 5.477 9 5.477a4.5 4.5 0 014.5 4.5c0 4.028-3.268 8.287-6 10.546-2.732-2.259-6-6.518-6-10.546A4.5 4.5 0 016.343 5.477 9 5.477" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  Sparkles: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Chart: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Alert: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Target: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Search: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  X: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Link: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
  Cpu: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>,
  History: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  ArrowRight: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>,
  Home: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Layers: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  Play: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Download: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  Upload: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  ZoomIn: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" /></svg>,
  ZoomOut: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>,
  Center: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>,
  Zap: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Chat: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
};

// --- Translations ---
const TRANSLATIONS = {
  en: {
    hero: {
      headline: "Find the money before saturation.",
      sub: "Our system maps the relation between supply & demand to reveal invisible opportunities.",
      cta: "Analyze a Niche",
      placeholder: "e.g., 'SaaS for Dentists' or 'Eco-friendly Coffee'",
      suggestions_title: "Need Inspiration?",
    },
    how_it_works: {
      title: "Operational Workflow",
      step1_title: "Define Niche",
      step1_desc: "Input a market to initialize the Core.",
      step2_title: "Deploy Agents",
      step2_desc: "Connect specialized AI modules to audit supply, demand, and gaps.",
      step3_title: "Strategic Verdict",
      step3_desc: "Receive a GO/NO-GO decision and execution plan.",
      nodes_title: "Available Intelligence Modules",
      node_desc_audit: "Calculates Opportunity Score (0-100).",
      node_desc_trends: "Identifies rising micro-trends.",
      node_desc_problems: "Extracts expensive pain points.",
      node_desc_gaps: "Finds Blue Ocean opportunities.",
      node_desc_ads: "Generates high-CTR angles.",
    },
    history: {
      title: "Recent Investigations",
      empty: "No previous research found. Start your first analysis above.",
      load: "Open",
      delete: "Delete",
      last_edited: "Edited",
      export: "Export",
      import: "Import Project",
    },
    canvas: {
      root_title: "Market Core",
      drag_hint: "Drag nodes to organize • Connect modules to build strategy",
      generate_btn: "Generate Strategy",
      analyzing: "Analyzing...",
      system_status: "System Online: Gemini 2.5 Flash",
      back_home: "Back to Dashboard",
      saved: "Saved",
    },
    nodes: {
      [NodeType.TRENDS]: "Market Trends",
      [NodeType.PROBLEMS]: "Pain Points",
      [NodeType.ADS]: "Ad Angles",
      [NodeType.COMPETITORS]: "Competitors",
      [NodeType.GAPS]: "Blue Oceans",
      [NodeType.MARKET_AUDIT]: "Market Audit",
    },
    audit: {
      demand: "Demand",
      supply: "Supply",
      score: "Opportunity Score",
      saturation_alert: "Risk Radar",
      growth: "Growth",
    },
    report: {
      title: "Strategic Execution Plan",
      verdict_label: "STRATEGIC VERDICT",
      viability: "Viability Score",
      stack: "Recommended Tech Stack",
      opportunities: "Key Opportunities",
      subniches: "Profitable Sub-niches",
      back: "Back to Canvas",
      export_pdf: "Export PDF",
      where_start: "Where do you want to start?",
      action_card_btn: "Get Day 1 Plan",
      mentor_title: "Mentor's Advice",
    },
    suggestions: [
      "AI Legal Assistant",
      "Senior Care SaaS",
      "Subscription Coffee",
      "Remote Team Building"
    ]
  },
  pt: {
    hero: {
      headline: "Descubra o dinheiro antes da saturação.",
      sub: "Nosso sistema mapeia a relação entre oferta e demanda e revela oportunidades invisíveis.",
      cta: "Analisar Nicho Agora",
      placeholder: "ex: 'SaaS para Dentistas' ou 'Café Eco-friendly'",
      suggestions_title: "Precisa de Inspiração?",
    },
    how_it_works: {
      title: "Fluxo Operacional",
      step1_title: "Definir Nicho",
      step1_desc: "Insira um mercado para iniciar o Núcleo.",
      step2_title: "Implantar Agentes",
      step2_desc: "Conecte módulos de IA para auditar oferta, demanda e lacunas.",
      step3_title: "Veredito Estratégico",
      step3_desc: "Receba uma decisão GO/NO-GO e plano de execução.",
      nodes_title: "Módulos de Inteligência Disponíveis",
      node_desc_audit: "Calcula Score de Oportunidade (0-100).",
      node_desc_trends: "Identifica micro-tendências em alta.",
      node_desc_problems: "Extrai dores caras e latentes.",
      node_desc_gaps: "Encontra oportunidades Oceano Azul.",
      node_desc_ads: "Gera ângulos de alta conversão.",
    },
    history: {
      title: "Investigações Recentes",
      empty: "Nenhuma pesquisa anterior encontrada. Comece sua primeira análise acima.",
      load: "Abrir",
      delete: "Apagar",
      last_edited: "Editado",
      export: "Exportar",
      import: "Importar Projeto",
    },
    canvas: {
      root_title: "Núcleo do Mercado",
      drag_hint: "Arraste para organizar • Conecte módulos para criar estratégia",
      generate_btn: "Gerar Estratégia",
      analyzing: "Analisando...",
      system_status: "Sistema Online: Gemini 2.5 Flash",
      back_home: "Voltar ao Dashboard",
      saved: "Salvo",
    },
    nodes: {
      [NodeType.TRENDS]: "Tendências",
      [NodeType.PROBLEMS]: "Dores Reais",
      [NodeType.ADS]: "Ângulos de Ads",
      [NodeType.COMPETITORS]: "Concorrentes",
      [NodeType.GAPS]: "Oceanos Azuis",
      [NodeType.MARKET_AUDIT]: "Auditoria de Mercado",
    },
    audit: {
      demand: "Demanda",
      supply: "Oferta",
      score: "Score de Oportunidade",
      saturation_alert: "Radar de Risco",
      growth: "Crescimento",
    },
    report: {
      title: "Plano de Execução Estratégica",
      verdict_label: "VEREDITO ESTRATÉGICO",
      viability: "Viabilidade",
      stack: "Tech Stack Recomendada",
      opportunities: "Oportunidades Chave",
      subniches: "Sub-nichos Lucrativos",
      back: "Voltar ao Canvas",
      export_pdf: "Exportar PDF",
      where_start: "Por onde você quer começar?",
      action_card_btn: "Gerar Plano do Dia 1",
      mentor_title: "Conselho do Mentor",
    },
    suggestions: [
      "Assistente Jurídico IA",
      "SaaS para Idosos",
      "Clube de Café",
      "Team Building Remoto"
    ]
  }
};

// --- Components ---

const LanguageToggle: React.FC<{ lang: Language; setLang: (l: Language) => void }> = ({ lang, setLang }) => (
  <div className="absolute top-4 right-4 z-50 flex gap-2 bg-slate-900/50 p-1 rounded-full border border-slate-700 no-print">
    <button 
      onClick={() => setLang('en')}
      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${lang === 'en' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}
    >
      EN
    </button>
    <button 
      onClick={() => setLang('pt')}
      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${lang === 'pt' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}
    >
      PT
    </button>
  </div>
);

interface NodeProps {
  node: Node;
  onDragStart: (e: React.MouseEvent, id: string) => void;
  onDelete: (id: string) => void;
  onConnectStart: (e: React.MouseEvent, id: string) => void;
  onConnectEnd: (id: string) => void;
  lang: Language;
  zoom: number;
}

const NodeComponent: React.FC<NodeProps> = ({ node, onDragStart, onDelete, onConnectStart, onConnectEnd, lang, zoom }) => {
  const t = TRANSLATIONS[lang];
  const isAudit = node.type === NodeType.MARKET_AUDIT;
  const isRoot = node.type === NodeType.ROOT;

  // Custom Colors per Node Type
  const getNodeColor = (type: NodeType) => {
    switch (type) {
      case NodeType.ROOT: return 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]';
      case NodeType.MARKET_AUDIT: return 'border-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.4)]';
      case NodeType.PROBLEMS: return 'border-red-500';
      case NodeType.GAPS: return 'border-emerald-500';
      default: return 'border-slate-600';
    }
  };

  return (
    <div
      className={`absolute w-80 rounded-xl glass-panel transition-all duration-100 border ${getNodeColor(node.type)} flex flex-col group/node`}
      style={{ left: node.x, top: node.y, transformOrigin: 'top left' }}
      onMouseDown={(e) => onDragStart(e, node.id)}
      onMouseUp={() => onConnectEnd(node.id)}
    >
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex justify-between items-center bg-slate-900/40 rounded-t-xl cursor-move select-none">
        <div className="flex items-center gap-2">
          {isAudit ? <span className="text-fuchsia-400"><Icons.Target /></span> : <span className="text-cyan-400"><Icons.Brain /></span>}
          <span className="font-semibold text-sm text-slate-100 uppercase tracking-wider">
            {node.type === NodeType.ROOT ? t.canvas.root_title : t.nodes[node.type] || node.type}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
           {/* Connection Handle */}
           <button
            className="w-6 h-6 rounded-full bg-slate-800/50 hover:bg-cyan-600 border border-slate-600 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-crosshair active:scale-95"
            onMouseDown={(e) => {
              e.stopPropagation();
              onConnectStart(e, node.id);
            }}
            title="Drag to connect"
          >
            <Icons.Link />
          </button>

          {node.type !== NodeType.ROOT && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(node.id); }} className="text-slate-500 hover:text-red-400 transition-colors">
              <Icons.Trash />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 overflow-y-auto max-h-[300px] cursor-default" onMouseDown={e => e.stopPropagation()}>
        {node.data.status === 'LOADING' ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-3">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-slate-400 animate-pulse">{t.canvas.analyzing}</span>
          </div>
        ) : (
          <div className="space-y-4">
            {node.data.errorMessage ? (
              <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded">{node.data.errorMessage}</div>
            ) : (
              <>
                {/* Description */}
                {node.data.description && (
                  <p className="text-xs text-slate-400 italic border-l-2 border-slate-600 pl-2">
                    "{node.data.description}"
                  </p>
                )}

                {/* --- SUB-NICHES FOR ROOT --- */}
                {isRoot && node.data.subNiches && node.data.subNiches.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Top Sub-niches</p>
                    <div className="flex flex-wrap gap-2">
                      {node.data.subNiches.map((sub, idx) => (
                        <span key={idx} className="text-xs bg-cyan-900/30 text-cyan-300 px-2 py-1 rounded border border-cyan-500/30">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* --- MARKET AUDIT COCKPIT --- */}
                {isAudit && node.data.auditData ? (
                  <div className="space-y-4 pt-1">
                    {/* Opportunity Score Circle */}
                    <div className="flex flex-col items-center justify-center bg-slate-900/50 p-4 rounded-xl border border-slate-700 relative overflow-hidden group">
                      <div className={`absolute inset-0 bg-gradient-to-br opacity-10 transition-opacity ${node.data.auditData.opportunityScore >= 70 ? 'from-emerald-500' : node.data.auditData.opportunityScore < 40 ? 'from-red-500' : 'from-yellow-500'} to-transparent`} />
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold">{t.audit.score}</span>
                      <div className={`text-5xl font-black ${node.data.auditData.opportunityScore >= 70 ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]' : node.data.auditData.opportunityScore < 40 ? 'text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]' : 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]'}`}>
                        {node.data.auditData.opportunityScore}
                      </div>
                      <div className="text-[10px] font-bold mt-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                        {node.data.auditData.verdict}
                      </div>
                    </div>

                    {/* Growth & Risk Grid - More Prominent */}
                    <div className="grid grid-cols-2 gap-2">
                       <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700 flex flex-col items-center justify-center text-center hover:bg-slate-700/60 transition-colors">
                          <span className="text-[10px] text-emerald-400 uppercase font-bold mb-1 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                            {t.audit.growth}
                          </span>
                          <span className="text-sm font-bold text-white">{node.data.auditData.growthRate}</span>
                       </div>
                       <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700 flex flex-col items-center justify-center text-center hover:bg-slate-700/60 transition-colors">
                          <span className="text-[10px] text-orange-400 uppercase font-bold mb-1 flex items-center gap-1">
                             <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                             {t.audit.saturation_alert}
                          </span>
                          <span className="text-xs font-bold text-white leading-tight">{node.data.auditData.saturationRisk}</span>
                       </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-4 bg-slate-900/30 p-3 rounded-lg border border-white/5">
                      <div>
                        <div className="flex justify-between items-end mb-1">
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                             {t.audit.demand}
                          </span>
                          <span className="text-xs font-mono text-emerald-200">{node.data.auditData.demandScore}/100</span>
                        </div>
                        <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                          <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]" style={{ width: `${node.data.auditData.demandScore}%` }} />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-end mb-1">
                          <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                             <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                             {t.audit.supply}
                          </span>
                          <span className="text-xs font-mono text-red-200">{node.data.auditData.supplyScore}/100</span>
                        </div>
                        <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                          <div className="h-full bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_8px_rgba(248,113,113,0.3)]" style={{ width: `${node.data.auditData.supplyScore}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // --- STANDARD NODE CONTENT ---
                  <ul className="space-y-2">
                    {node.data.content.map((item, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex items-start gap-2 group">
                        <span className="text-cyan-500 mt-1 opacity-50 group-hover:opacity-100 transition-opacity">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Helper Functions ---
const getBezierPath = (x1: number, y1: number, x2: number, y2: number) => {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const tension = 0.5;

  // Adapt curve based on horizontal/vertical distance for cleaner look
  if (dx > dy) {
    return `M ${x1} ${y1} C ${x1 + dx * tension} ${y1}, ${x2 - dx * tension} ${y2}, ${x2} ${y2}`;
  } else {
    return `M ${x1} ${y1} C ${x1} ${y1 + dy * tension}, ${x2} ${y2 - dy * tension}, ${x2} ${y2}`;
  }
};

const STORAGE_KEY = 'MICROS_PROJECTS';

const saveProjectsToStorage = (projects: Project[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

const getProjectsFromStorage = (): Project[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// --- Main App ---

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('ONBOARDING');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [niche, setNiche] = useState('');
  const [report, setReport] = useState<ReportData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lang, setLang] = useState<Language>('en');

  // History State
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Canvas State
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const isDraggingCanvas = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Connection State
  const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
  const [tempConnectionEnd, setTempConnectionEnd] = useState<{x: number, y: number} | null>(null);

  // Mentor State
  const [mentorAdvice, setMentorAdvice] = useState<MentorAdvice | null>(null);
  const [isAskingMentor, setIsAskingMentor] = useState(false);

  const t = TRANSLATIONS[lang];

  // Load Projects on Mount
  useEffect(() => {
    const loaded = getProjectsFromStorage();
    setSavedProjects(loaded);
  }, []);

  // Auto-Save Effect
  useEffect(() => {
    if (currentProjectId && nodes.length > 0) {
      const updatedProject: Project = {
        id: currentProjectId,
        niche: niche,
        createdAt: savedProjects.find(p => p.id === currentProjectId)?.createdAt || Date.now(),
        lastModified: Date.now(),
        nodes,
        connections,
        report,
        lang
      };

      const otherProjects = savedProjects.filter(p => p.id !== currentProjectId);
      const newProjectList = [updatedProject, ...otherProjects];
      
      setSavedProjects(newProjectList);
      saveProjectsToStorage(newProjectList);
      setLastSaved(new Date());
    }
  }, [nodes, connections, report]); // Trigger save when these change

  const startNewProject = async (selectedNiche: string) => {
    if (!selectedNiche) return;
    setNiche(selectedNiche);
    
    // Create Unique ID for new project
    const newProjectId = `proj-${Date.now()}`;
    setCurrentProjectId(newProjectId);
    setConnections([]);
    setReport(null);
    setMentorAdvice(null);
    setZoom(1);
    setPan({x: 0, y: 0});

    // Create Root Node
    const rootNode: Node = {
      id: 'root',
      type: NodeType.ROOT,
      x: window.innerWidth / 2 - 160,
      y: window.innerHeight / 2 - 200,
      width: 320,
      height: 400,
      data: {
        title: selectedNiche,
        nicheContext: selectedNiche,
        content: [],
        status: 'LOADING'
      }
    };
    
    setNodes([rootNode]);
    setView('CANVAS');

    // Fetch Initial Insights
    const insights = await generateNodeInsights(NodeType.ROOT, selectedNiche, lang);
    setNodes(prev => prev.map(n => n.id === 'root' ? {
      ...n,
      data: { 
        ...n.data, 
        content: insights.items,
        subNiches: insights.subNiches,
        status: 'SUCCESS', 
        description: insights.description 
      }
    } : n));
  };

  const loadProject = (project: Project) => {
    setCurrentProjectId(project.id);
    setNiche(project.niche);
    setNodes(project.nodes);
    setConnections(project.connections);
    setReport(project.report);
    setLang(project.lang);
    setMentorAdvice(null);
    setZoom(1);
    setPan({x: 0, y: 0});
    setView(project.report ? 'REPORT' : 'CANVAS');
  };

  const deleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = savedProjects.filter(p => p.id !== id);
    setSavedProjects(filtered);
    saveProjectsToStorage(filtered);
  };

  const exportProject = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${project.niche.replace(/\s+/g, '_')}_micros.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedProject = JSON.parse(event.target?.result as string);
        // Basic validation
        if (!importedProject.id || !importedProject.nodes) throw new Error("Invalid format");
        
        // Ensure unique ID
        importedProject.id = `proj-imp-${Date.now()}`;
        importedProject.lastModified = Date.now();
        
        const newProjectList = [importedProject, ...savedProjects];
        setSavedProjects(newProjectList);
        saveProjectsToStorage(newProjectList);
      } catch (err) {
        alert("Failed to import project. Invalid file format.");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset input
  };

  const handleBackToDashboard = () => {
    setView('ONBOARDING');
    setCurrentProjectId(null);
    setNodes([]);
    setConnections([]);
    setReport(null);
    setNiche('');
    setMentorAdvice(null);
  };

  // Add Child Node
  const addNode = async (type: NodeType) => {
    const id = `node-${Date.now()}`;
    const root = nodes.find(n => n.type === NodeType.ROOT);
    if (!root) return;

    // Position randomly around root with some offset for zoom
    const angle = Math.random() * Math.PI * 2;
    const radius = 350 + Math.random() * 100;
    const x = root.x + Math.cos(angle) * radius;
    const y = root.y + Math.sin(angle) * radius;

    const newNode: Node = {
      id,
      type,
      x,
      y,
      width: 320,
      height: 300,
      data: {
        title: t.nodes[type],
        nicheContext: niche,
        content: [],
        status: 'LOADING'
      }
    };

    setNodes(prev => [...prev, newNode]);
    // Auto-connect to root for ease of use
    setConnections(prev => [...prev, { id: `conn-${Date.now()}`, from: 'root', to: id }]);

    // Context from Root
    const context = root.data.content.join('; ');
    const insights = await generateNodeInsights(type, niche, lang, context);

    setNodes(prev => prev.map(n => n.id === id ? {
      ...n,
      data: { 
        ...n.data, 
        content: insights.items, 
        stats: insights.stats, 
        status: 'SUCCESS',
        description: insights.description,
        auditData: insights.auditData // Only present if type is MARKET_AUDIT
      }
    } : n));
  };

  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    // Aggregate all data
    const aggregated = nodes.map(n => 
      `Node: ${n.type}\nInsights: ${n.data.content.join(', ')}\nSummary: ${n.data.description || ''}\nStats: ${JSON.stringify(n.data.stats || [])}`
    ).join('\n---\n');

    try {
      const result = await generateFinalReport(niche, aggregated, lang);
      setReport(result);
      setView('REPORT');
    } catch (e) {
      alert("Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMentorRequest = async (opp: string) => {
    setIsAskingMentor(true);
    setMentorAdvice(null); // Clear previous
    try {
      const advice = await generateMentorAdvice(opp, lang);
      setMentorAdvice(advice);
    } catch(e) {
      console.error(e);
    } finally {
      setIsAskingMentor(false);
    }
  };

  // Connection Handlers
  const handleConnectStart = (e: React.MouseEvent, id: string) => {
    setConnectingNodeId(id);
    // Adjust for zoom/pan
    const canvasX = (e.clientX - pan.x) / zoom;
    const canvasY = (e.clientY - pan.y) / zoom;
    setTempConnectionEnd({ x: canvasX, y: canvasY });
  };

  const handleConnectEnd = (targetId: string) => {
    if (connectingNodeId && connectingNodeId !== targetId) {
      // Create connection if not exists
      const exists = connections.some(c =>
        (c.from === connectingNodeId && c.to === targetId) ||
        (c.from === targetId && c.to === connectingNodeId)
      );
      if (!exists) {
         setConnections(prev => [...prev, { id: `conn-${Date.now()}`, from: connectingNodeId, to: targetId }]);
      }
    }
    setConnectingNodeId(null);
    setTempConnectionEnd(null);
  };

  // Canvas Interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingCanvas.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (connectingNodeId) {
       // Update temp connection line relative to pan/zoom
       const canvasX = (e.clientX - pan.x) / zoom;
       const canvasY = (e.clientY - pan.y) / zoom;
       setTempConnectionEnd({ x: canvasX, y: canvasY });
    } else if (draggingNode) {
      // Dragging a node
      const dx = (e.clientX - lastMousePos.current.x) / zoom;
      const dy = (e.clientY - lastMousePos.current.y) / zoom;
      setNodes(prev => prev.map(n => n.id === draggingNode ? { ...n, x: n.x + dx, y: n.y + dy } : n));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    } else if (isDraggingCanvas.current) {
      // Panning the canvas
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    isDraggingCanvas.current = false;
    setDraggingNode(null);
    // Cancel connection drag if dropped on canvas
    if (connectingNodeId) {
      setConnectingNodeId(null);
      setTempConnectionEnd(null);
    }
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(prev + delta, 0.1), 3));
  };

  // Render Connections with SVG Path (Bezier)
  const renderConnections = () => {
    return (
      <>
        {connections.map(conn => {
          const fromNode = nodes.find(n => n.id === conn.from);
          const toNode = nodes.find(n => n.id === conn.to);
          if (!fromNode || !toNode) return null;

          const x1 = fromNode.x + fromNode.width / 2;
          const y1 = fromNode.y + fromNode.height / 2;
          const x2 = toNode.x + toNode.width / 2;
          const y2 = toNode.y + toNode.height / 2;
          const pathD = getBezierPath(x1, y1, x2, y2);

          return (
            <path 
              key={conn.id} 
              d={pathD}
              fill="none"
              stroke="rgba(6,182,212, 0.4)" 
              strokeWidth={3} 
              strokeLinecap="round"
            />
          );
        })}
        {/* Temp Connection Line */}
        {connectingNodeId && tempConnectionEnd && (() => {
           const fromNode = nodes.find(n => n.id === connectingNodeId);
           if (!fromNode) return null;
           const x1 = fromNode.x + fromNode.width / 2;
           const y1 = fromNode.y + fromNode.height / 2;
           const x2 = tempConnectionEnd.x;
           const y2 = tempConnectionEnd.y;
           const pathD = getBezierPath(x1, y1, x2, y2);
           
           return (
             <path 
               d={pathD}
               fill="none"
               stroke="rgba(250, 204, 21, 0.8)" 
               strokeWidth={3} 
               strokeDasharray="8"
               className="connection-line"
             />
           );
        })()}
      </>
    );
  };

  // --- Views ---

  if (view === 'ONBOARDING') {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0f172a] relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none"></div>
        <LanguageToggle lang={lang} setLang={setLang} />
        
        {/* Main Content Area (Scrollable if needed) */}
        <div className="z-10 w-full max-w-4xl px-6 flex flex-col items-center h-full overflow-y-auto py-12 scroll-smooth">
          
          <div className="text-center max-w-2xl">
            <div className="mb-6 inline-block bg-cyan-900/30 text-cyan-400 px-4 py-1.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              M.I.C.R.O.S. v1.3
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
              {t.hero.headline}
            </h1>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed font-light">
              {t.hero.sub}
            </p>

            <div className="flex flex-col gap-4 max-w-md mx-auto w-full mb-8">
              <div className="relative group">
                <input
                  type="text"
                  placeholder={t.hero.placeholder}
                  className="w-full bg-slate-800/80 border border-slate-600 text-white px-6 py-4 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-center placeholder-slate-500 shadow-xl"
                  onKeyDown={(e) => e.key === 'Enter' && startNewProject(e.currentTarget.value)}
                />
                <div className="absolute inset-0 rounded-xl bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none blur-xl"></div>
              </div>
              <button 
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling?.querySelector('input') as HTMLInputElement;
                  startNewProject(input.value);
                }}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transform transition hover:scale-[1.02] active:scale-[0.98]"
              >
                {t.hero.cta}
              </button>
            </div>
          </div>

          {/* Workflow Visualization */}
          <div className="w-full max-w-4xl mt-12 mb-12 animate-in fade-in zoom-in duration-700">
             <div className="text-center mb-8">
                <h3 className="text-slate-500 text-sm uppercase tracking-widest font-bold flex items-center justify-center gap-2">
                   <Icons.Layers /> {t.how_it_works.title}
                </h3>
             </div>
             
             <div className="grid md:grid-cols-3 gap-6 relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-slate-700 to-transparent z-0"></div>

                {/* Step 1 */}
                <div className="relative z-10 bg-slate-900/80 border border-slate-700 p-6 rounded-xl text-center backdrop-blur-sm group hover:border-cyan-500/50 transition-all">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-600 group-hover:scale-110 transition-transform text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                     <Icons.Brain />
                  </div>
                  <h4 className="font-bold text-white mb-2">{t.how_it_works.step1_title}</h4>
                  <p className="text-xs text-slate-400">{t.how_it_works.step1_desc}</p>
                </div>

                {/* Step 2 (Interactive Nodes) */}
                <div className="relative z-10 bg-slate-900/80 border border-slate-700 p-6 rounded-xl text-center backdrop-blur-sm group hover:border-fuchsia-500/50 transition-all">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-600 group-hover:scale-110 transition-transform text-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.3)]">
                     <Icons.Layers />
                  </div>
                  <h4 className="font-bold text-white mb-4">{t.how_it_works.step2_title}</h4>
                  <p className="text-xs text-slate-400 mb-4">{t.how_it_works.step2_desc}</p>
                  
                  {/* Mini Node Grid */}
                  <div className="grid grid-cols-3 gap-2">
                     <div className="p-2 bg-slate-800/50 rounded flex flex-col items-center gap-1 hover:bg-slate-700 transition-colors cursor-help" title={t.how_it_works.node_desc_audit}>
                       <div className="text-fuchsia-400"><Icons.Target /></div>
                       <span className="text-[8px] uppercase font-bold text-slate-300">Audit</span>
                     </div>
                     <div className="p-2 bg-slate-800/50 rounded flex flex-col items-center gap-1 hover:bg-slate-700 transition-colors cursor-help" title={t.how_it_works.node_desc_trends}>
                       <div className="text-slate-400"><Icons.Chart /></div>
                       <span className="text-[8px] uppercase font-bold text-slate-300">Trends</span>
                     </div>
                     <div className="p-2 bg-slate-800/50 rounded flex flex-col items-center gap-1 hover:bg-slate-700 transition-colors cursor-help" title={t.how_it_works.node_desc_problems}>
                       <div className="text-red-400"><Icons.Alert /></div>
                       <span className="text-[8px] uppercase font-bold text-slate-300">Pain</span>
                     </div>
                     <div className="p-2 bg-slate-800/50 rounded flex flex-col items-center gap-1 hover:bg-slate-700 transition-colors cursor-help" title={t.how_it_works.node_desc_gaps}>
                       <div className="text-emerald-400"><Icons.Search /></div>
                       <span className="text-[8px] uppercase font-bold text-slate-300">Gaps</span>
                     </div>
                     <div className="p-2 bg-slate-800/50 rounded flex flex-col items-center gap-1 hover:bg-slate-700 transition-colors cursor-help" title={t.how_it_works.node_desc_ads}>
                       <div className="text-yellow-400"><Icons.Sparkles /></div>
                       <span className="text-[8px] uppercase font-bold text-slate-300">Ads</span>
                     </div>
                     <div className="p-2 bg-slate-800/50 rounded flex flex-col items-center gap-1 hover:bg-slate-700 transition-colors">
                       <div className="text-blue-400"><Icons.Cpu /></div>
                       <span className="text-[8px] uppercase font-bold text-slate-300">Comp</span>
                     </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative z-10 bg-slate-900/80 border border-slate-700 p-6 rounded-xl text-center backdrop-blur-sm group hover:border-emerald-500/50 transition-all">
                   <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-600 group-hover:scale-110 transition-transform text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                     <Icons.Play />
                  </div>
                  <h4 className="font-bold text-white mb-2">{t.how_it_works.step3_title}</h4>
                  <p className="text-xs text-slate-400">{t.how_it_works.step3_desc}</p>
                </div>
             </div>
          </div>

          {/* Project History Section */}
          <div className="w-full max-w-3xl border-t border-slate-800 pt-8 mb-12 animate-in slide-in-from-bottom-6 duration-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-slate-500 text-sm uppercase tracking-widest font-bold flex items-center gap-2">
                <Icons.History /> {t.history.title}
              </h3>
              <div className="flex gap-2">
                <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept=".json" />
                <button onClick={handleImportClick} className="text-[10px] flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded border border-slate-600 transition-colors">
                  <Icons.Upload /> {t.history.import}
                </button>
              </div>
            </div>
            
            {savedProjects.length === 0 ? (
              <div className="text-center py-8 text-slate-600 italic border border-slate-800 rounded-xl border-dashed">
                {t.history.empty}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {savedProjects.slice(0, 4).map(project => (
                  <div 
                    key={project.id} 
                    onClick={() => loadProject(project)}
                    className="group bg-slate-800/40 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 p-4 rounded-xl cursor-pointer transition-all flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">{project.niche}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {t.history.last_edited}: {new Date(project.lastModified).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {project.report && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">Report</span>}
                        <span className="text-[10px] bg-slate-700 text-slate-400 px-2 py-0.5 rounded">{project.nodes.length} Nodes</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => exportProject(project, e)}
                        className="text-slate-500 hover:text-blue-400 p-1.5 hover:bg-slate-700 rounded-full transition-colors"
                        title={t.history.export}
                      >
                        <Icons.Download />
                      </button>
                      <button 
                        onClick={(e) => deleteProject(project.id, e)}
                        className="text-slate-500 hover:text-red-400 p-1.5 hover:bg-slate-700 rounded-full transition-colors"
                        title={t.history.delete}
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-8 text-center opacity-80">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">{t.hero.suggestions_title}</p>
              <div className="flex flex-wrap justify-center gap-3">
                {t.suggestions.map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => startNewProject(s)}
                    className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 hover:border-cyan-500/50 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  if (view === 'REPORT') {
    return (
      <div className="h-screen w-screen bg-[#0f172a] overflow-y-auto relative">
        <LanguageToggle lang={lang} setLang={setLang} />
        <div className="max-w-4xl mx-auto p-8 md:p-12 print:p-0">
          <div className="flex justify-between items-center mb-8 no-print">
            <button onClick={() => setView('CANVAS')} className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
               ← {t.report.back}
            </button>
            <button onClick={() => window.print()} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg transition-colors">
               <Icons.Download /> {t.report.export_pdf}
            </button>
          </div>
          
          {report && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Header / Verdict */}
              <div className="text-center mb-12">
                <div className="text-xs font-bold text-slate-500 tracking-[0.3em] uppercase mb-4">{t.report.verdict_label}</div>
                <div className={`text-6xl md:text-8xl font-black mb-6 tracking-tight
                  ${report.verdict === 'GO' ? 'text-emerald-400 drop-shadow-[0_0_25px_rgba(52,211,153,0.5)]' : 
                    report.verdict === 'NO-GO' ? 'text-red-500 drop-shadow-[0_0_25px_rgba(239,68,68,0.5)]' : 
                    'text-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,0.5)]'}`
                }>
                  {report.verdict}
                </div>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed border-l-4 border-slate-700 pl-6 text-left italic">
                  "{report.summary}"
                </p>
              </div>

              {/* Sub-niches Highlight */}
              {report.subNichesHighlights && report.subNichesHighlights.length > 0 && (
                <div className="glass-panel p-6 rounded-2xl mb-8 border-l-4 border-fuchsia-500">
                  <h3 className="text-sm font-bold text-fuchsia-400 uppercase tracking-wider mb-4">{t.report.subniches}</h3>
                  <div className="flex flex-wrap gap-3">
                    {report.subNichesHighlights.map((sn, i) => (
                      <span key={i} className="px-3 py-1.5 bg-fuchsia-900/30 text-fuchsia-200 rounded-full border border-fuchsia-500/30 text-sm font-medium">
                        {sn}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-6">
                {/* Viability Score */}
                <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                   <div className="text-sm text-slate-400 mb-2">{t.report.viability}</div>
                   <div className="text-5xl font-bold text-white">{report.viabilityScore}<span className="text-2xl text-slate-600">/100</span></div>
                </div>
                
                {/* Tech Stack */}
                <div className="glass-panel p-6 rounded-2xl md:col-span-2">
                  <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4">{t.report.stack}</h3>
                  <div className="flex flex-wrap gap-2">
                    {report.recommendedStack.map((item, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-800 text-slate-200 text-sm rounded-md border border-slate-700 print:bg-gray-200 print:text-black">{item}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Opportunities & Mentor Action */}
              <div className="glass-panel p-8 rounded-2xl border-t-4 border-cyan-500">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Icons.Sparkles /> {t.report.opportunities}
                  </h3>
                  <span className="text-xs text-cyan-400 animate-pulse font-bold">{t.report.where_start}</span>
                </div>
                <div className="space-y-6">
                  {report.opportunities.map((opp, i) => (
                    <div key={i} className="group p-4 bg-slate-800/30 hover:bg-slate-800/50 rounded-xl transition-colors border border-transparent hover:border-cyan-500/30">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xl font-semibold text-cyan-100 group-hover:text-cyan-400 transition-colors">{opp.title}</h4>
                        <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-400 print:bg-gray-200 print:text-black">Score: {opp.score}</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed text-sm mb-4">{opp.description}</p>
                      
                      {/* Interactive Action Button */}
                      <button 
                        onClick={() => handleMentorRequest(opp.title)}
                        className="text-xs font-bold flex items-center gap-2 text-cyan-400 hover:text-white bg-cyan-900/30 hover:bg-cyan-600 px-3 py-1.5 rounded-lg transition-all no-print"
                      >
                        <Icons.Zap /> {t.report.action_card_btn}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mentor Advice Modal/Overlay */}
              {mentorAdvice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 no-print animate-in fade-in duration-300" onClick={() => setMentorAdvice(null)}>
                  <div className="bg-slate-900 border border-slate-600 rounded-2xl max-w-lg w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Icons.Chat /> {t.report.mentor_title}
                      </h3>
                      <button onClick={() => setMentorAdvice(null)} className="text-slate-500 hover:text-white"><Icons.X /></button>
                    </div>
                    
                    <div className="space-y-4 text-slate-300">
                      <div className="italic text-cyan-200 border-l-2 border-cyan-500 pl-3 py-1">
                        "{mentorAdvice.empatheticIntro}"
                      </div>
                      <h4 className="font-bold text-white mt-4">{mentorAdvice.stepTitle}</h4>
                      <ul className="space-y-3">
                        {mentorAdvice.steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="bg-slate-700 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 mt-0.5">{idx + 1}</span>
                            {step}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6 pt-4 border-t border-slate-700 font-bold text-center text-white">
                        {mentorAdvice.motivation}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isAskingMentor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 no-print">
                  <div className="bg-slate-900 border border-cyan-500 rounded-xl p-4 flex items-center gap-3 shadow-lg">
                    <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-cyan-400 font-bold text-sm">Consulting Mentor...</span>
                  </div>
                </div>
              )}
              
              <div className="text-center text-xs text-slate-600 mt-12 print:block hidden">
                 Generated by M.I.C.R.O.S. Intelligence System on {new Date().toLocaleDateString()}
              </div>

            </div>
          )}
        </div>
      </div>
    );
  }

  // CANVAS VIEW
  return (
    <div 
      className="h-screen w-screen bg-[#0f172a] overflow-hidden relative"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <LanguageToggle lang={lang} setLang={setLang} />
      
      {/* Top Bar: Back & Status */}
      <div className="absolute top-4 left-4 z-40 flex flex-col gap-2 no-print">
        <button 
          onClick={handleBackToDashboard}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-bold text-slate-300 transition-colors shadow-lg"
        >
          <Icons.Home /> {t.canvas.back_home}
        </button>
        
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-700 rounded-lg backdrop-blur-md w-fit">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{t.canvas.system_status}</span>
        </div>
        
        {lastSaved && (
          <div className="text-[10px] text-slate-500 px-1 animate-pulse">
            {t.canvas.saved} {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40 flex gap-1 bg-slate-900/80 border border-slate-700 rounded-lg p-1 backdrop-blur-md shadow-xl no-print">
         <button onClick={() => handleZoom(-0.1)} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"><Icons.ZoomOut /></button>
         <button onClick={() => { setZoom(1); setPan({x:0,y:0}); }} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"><Icons.Center /></button>
         <button onClick={() => handleZoom(0.1)} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"><Icons.ZoomIn /></button>
         <span className="text-[10px] font-mono text-slate-500 flex items-center px-2 border-l border-slate-700">{Math.round(zoom * 100)}%</span>
      </div>

      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`, transformOrigin: '0 0' }}></div>

      {/* Infinite Canvas Content */}
      <div 
        className="absolute inset-0 transition-transform duration-75 ease-out origin-top-left"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          {renderConnections()}
        </svg>

        {nodes.map(node => (
          <NodeComponent 
            key={node.id} 
            node={node} 
            onDragStart={(e, id) => {
              e.stopPropagation();
              setDraggingNode(id);
              lastMousePos.current = { x: e.clientX, y: e.clientY };
            }}
            onConnectStart={handleConnectStart}
            onConnectEnd={handleConnectEnd}
            onDelete={deleteNode}
            lang={lang}
            zoom={zoom}
          />
        ))}
      </div>

      {/* Toolbar */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 glass-panel px-6 py-4 rounded-2xl flex gap-4 shadow-2xl z-50 no-print">
        <button onClick={() => addNode(NodeType.MARKET_AUDIT)} className="flex flex-col items-center gap-1 group">
          <div className="w-10 h-10 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-fuchsia-900/50 transition-all group-hover:scale-110">
            <Icons.Target />
          </div>
          <span className="text-[10px] text-fuchsia-300 font-bold uppercase tracking-wider">{t.nodes.MARKET_AUDIT}</span>
        </button>

        <div className="w-px bg-slate-700 mx-2"></div>

        <button onClick={() => addNode(NodeType.TRENDS)} className="flex flex-col items-center gap-1 group">
          <div className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-all group-hover:scale-110">
            <Icons.Chart />
          </div>
          <span className="text-[10px] text-slate-400">{t.nodes.TRENDS}</span>
        </button>
        <button onClick={() => addNode(NodeType.PROBLEMS)} className="flex flex-col items-center gap-1 group">
          <div className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-all group-hover:scale-110">
            <Icons.Alert />
          </div>
          <span className="text-[10px] text-slate-400">{t.nodes.PROBLEMS}</span>
        </button>
        <button onClick={() => addNode(NodeType.GAPS)} className="flex flex-col items-center gap-1 group">
          <div className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-all group-hover:scale-110">
            <Icons.Search />
          </div>
          <span className="text-[10px] text-slate-400">{t.nodes.GAPS}</span>
        </button>
        <button onClick={() => addNode(NodeType.ADS)} className="flex flex-col items-center gap-1 group">
          <div className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-all group-hover:scale-110">
            <Icons.Sparkles />
          </div>
          <span className="text-[10px] text-slate-400">{t.nodes.ADS}</span>
        </button>
      </div>

      {/* Generate Report Button */}
      {nodes.length > 2 && (
        <button 
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-8 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 z-50 no-print"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t.canvas.analyzing}
            </>
          ) : (
            <>
              <Icons.Brain /> {t.canvas.generate_btn}
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default App;
