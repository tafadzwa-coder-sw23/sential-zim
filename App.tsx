import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type, Chat } from '@google/genai';
import { Report, ReportCategory, Severity, ChatMessage } from './types';
import { INITIAL_REPORTS } from './mockData';

// --- Icons (SVGs) ---
const Icons = {
  Home: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>,
  Brain: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
  MapPin: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  AlertTriangle: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
  ThumbsUp: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>,
  Send: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Loader: () => <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
};

// --- Components ---

const Badge = ({ children, className }: { children?: React.ReactNode, className: string }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${className}`}>
    {children}
  </span>
);

const ReportCard: React.FC<{ report: Report }> = ({ report }) => {
  const getSeverityColor = (s: Severity) => {
    switch(s) {
      case Severity.CRITICAL: return 'bg-red-100 text-red-800 border-red-200';
      case Severity.HIGH: return 'bg-orange-100 text-orange-800 border-orange-200';
      case Severity.MEDIUM: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case Severity.LOW: return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor((Date.now() - ms) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4 transition-transform hover:scale-[1.01]">
      <div className="flex justify-between items-start mb-2">
        <Badge className={getSeverityColor(report.severity)}>{report.category}</Badge>
        <span className="text-xs text-gray-500">{formatTime(report.timestamp)}</span>
      </div>
      <h3 className="font-bold text-gray-900 text-lg mb-1">{report.title}</h3>
      <p className="text-gray-600 text-sm mb-3">{report.description}</p>
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center text-gray-500 text-xs">
          <Icons.MapPin />
          <span className="ml-1">{report.location}</span>
        </div>
        <div className="flex items-center text-gray-500 text-xs font-medium">
          <Icons.ThumbsUp />
          <span className="ml-1">{report.votes}</span>
        </div>
      </div>
    </div>
  );
};

const ReportForm = ({ onSubmit, onCancel }: { onSubmit: (report: Omit<Report, 'id' | 'timestamp' | 'votes' | 'status' | 'author'>) => void, onCancel: () => void }) => {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{title: string, category: ReportCategory, severity: Severity} | null>(null);

  const analyzeIncident = async () => {
    if (!description) return;
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze this neighborhood incident report for Zimbabwe context (e.g. ZESA, council water, potholes, crime).
        Provide a short title, a category, and a severity level.
        
        Description: "${description}"
        
        Respond with JSON only:
        {
          "title": "string",
          "category": "Safety Concern" | "Lost & Found" | "Infrastructure" | "Suspicious Activity" | "Community Event" | "Other",
          "severity": "Low" | "Medium" | "High" | "Critical"
        }`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              category: { type: Type.STRING, enum: Object.values(ReportCategory) },
              severity: { type: Type.STRING, enum: Object.values(Severity) }
            }
          }
        }
      });
      
      const result = JSON.parse(response.text);
      setAnalysis(result);
    } catch (e) {
      console.error("AI Analysis failed", e);
      // Fallback manual entry if AI fails
      setAnalysis({
        title: "New Report",
        category: ReportCategory.OTHER,
        severity: Severity.LOW
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = () => {
    if (analysis && location) {
      onSubmit({
        ...analysis,
        description,
        location
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-xl font-bold mb-4 text-gray-900">New Report</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">What happened?</label>
          <textarea
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
            rows={4}
            placeholder="Describe the incident (e.g. ZESA transformer sparks, lost dog...)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            placeholder="e.g. Corner Borrowdale Rd & Harare Dr"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {isAnalyzing ? (
           <div className="flex items-center justify-center p-4 text-green-600 bg-green-50 rounded-lg">
             <Icons.Loader />
             <span className="ml-2 font-medium">Analyzing incident details...</span>
           </div>
        ) : !analysis ? (
          <button
            onClick={analyzeIncident}
            disabled={!description}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <span className="mr-2"><Icons.Brain /></span>
            Analyze Report
          </button>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 animate-fade-in">
            <div className="mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase">Suggested Title</span>
              <p className="font-medium text-gray-900">{analysis.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase">Category</span>
                <p className="text-green-700 font-medium">{analysis.category}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase">Severity</span>
                <p className={`font-medium ${
                  analysis.severity === Severity.CRITICAL ? 'text-red-600' : 
                  analysis.severity === Severity.HIGH ? 'text-orange-600' : 'text-gray-900'
                }`}>{analysis.severity}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setAnalysis(null)}
                className="flex-1 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Edit
              </button>
              <button 
                onClick={handleSubmit}
                disabled={!location}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Submit Report
              </button>
            </div>
          </div>
        )}

        <button onClick={onCancel} className="w-full py-2 text-gray-500 hover:text-gray-700">Cancel</button>
      </div>
    </div>
  );
};

const AnalystChat = ({ reports }: { reports: Report[] }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'model', text: 'Mhoro! I am your Sentinel Zimbabwe Analyst. Ask me about recent incidents, ZESA patterns, or safety advice in your area.', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Initialize chat if not exists or if we want to refresh context often
      if (!chatRef.current) {
         chatRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: `You are a helpful neighborhood safety analyst for Sentinel Zimbabwe.
            You have access to the following active reports from the community:
            ${JSON.stringify(reports.map(r => ({ ...r, timestamp: new Date(r.timestamp).toISOString() })))}
            
            Use this data to answer questions about safety trends, specific incidents, or infrastructure issues (like ZESA or Council water).
            If asked about general safety in Zimbabwe, give relevant local advice (e.g. emergency numbers 999/112, ZESA fault lines).
            Be concise, friendly, and community-focused. Use "Mhoro" or "Salibonani" occasionally for greeting.`
          }
        });
      }

      const response = await chatRef.current.sendMessage({ message: input });
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        timestamp: Date.now()
      }]);
    } catch (e) {
      console.error("Chat error", e);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I'm having trouble connecting to the Sentinel network. Please try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'bg-green-600 text-white rounded-br-none' 
                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm">
              <Icons.Loader />
            </div>
          </div>
        )}
      </div>
      <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
        <input
          type="text"
          className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
          placeholder="Ask about safety, ZESA, or reports..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button 
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          <Icons.Send />
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'feed' | 'report' | 'analyst'>('feed');
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);

  const handleNewReport = (reportData: Omit<Report, 'id' | 'timestamp' | 'votes' | 'status' | 'author'>) => {
    const newReport: Report = {
      ...reportData,
      id: Date.now().toString(),
      timestamp: Date.now(),
      votes: 0,
      status: 'Open',
      author: 'You'
    };
    setReports([newReport, ...reports]);
    setActiveTab('feed');
  };

  return (
    <div className="min-h-screen pb-20 max-w-md mx-auto bg-gray-50 shadow-2xl overflow-hidden relative">
      {/* Header */}
      <header className="bg-green-700 text-white p-4 pt-8 sticky top-0 z-10 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Sentinel Zimbabwe</h1>
            <p className="text-green-100 text-xs">Neighborhood Watch & Safety</p>
          </div>
          <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center border border-green-500 text-xs font-bold">
            ZW
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {activeTab === 'feed' && (
          <div className="space-y-4 animate-fade-in">
             <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-gray-800">Community Feed</h2>
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{reports.length} Active</span>
             </div>
             {reports.map(report => (
               <ReportCard key={report.id} report={report} />
             ))}
          </div>
        )}

        {activeTab === 'report' && (
          <ReportForm 
            onSubmit={handleNewReport} 
            onCancel={() => setActiveTab('feed')} 
          />
        )}

        {activeTab === 'analyst' && (
          <AnalystChat reports={reports} />
        )}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 flex justify-around p-3 pb-6 z-20">
        <button 
          onClick={() => setActiveTab('feed')}
          className={`flex flex-col items-center space-y-1 ${activeTab === 'feed' ? 'text-green-600' : 'text-gray-400'}`}
        >
          <Icons.Home />
          <span className="text-[10px] font-medium">Feed</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('report')}
          className="flex flex-col items-center justify-center -mt-8 bg-green-600 text-white h-14 w-14 rounded-full shadow-lg hover:bg-green-700 transition-colors border-4 border-gray-50"
        >
          <Icons.Plus />
        </button>

        <button 
          onClick={() => setActiveTab('analyst')}
          className={`flex flex-col items-center space-y-1 ${activeTab === 'analyst' ? 'text-green-600' : 'text-gray-400'}`}
        >
          <Icons.Brain />
          <span className="text-[10px] font-medium">Analyst</span>
        </button>
      </nav>
    </div>
  );
}