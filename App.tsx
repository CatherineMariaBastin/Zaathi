
import React, { useState, useEffect, useRef } from 'react';
import { Page, Language, Patient, Medicine, Alert, PatientNote } from './types';
import { TRANSLATIONS, LANGUAGES } from './constants.tsx';
import VoiceInput from './components/VoiceInput';
import ClockPicker from './components/ClockPicker';
import { parseSmartOnboarding, parseSmartMedicine } from './services/geminiService';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [lang, setLang] = useState<Language>('en');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  // AI Assistant States
  const [aiOnboardingMode, setAiOnboardingMode] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [extractedData, setExtractedData] = useState<{name: string, age: number, condition: string} | null>(null);

  const [aiMedMode, setAiMedMode] = useState(false);
  const [aiMedInput, setAiMedInput] = useState("");
  const [isAiMedThinking, setIsAiMedThinking] = useState(false);
  const [extractedMedData, setExtractedMedData] = useState<Partial<Medicine> | null>(null);

  // Notes State
  const [noteInput, setNoteInput] = useState("");

  // Alarm State
  const [activeAlarm, setActiveAlarm] = useState<{ 
    patientId: string, 
    medId: string, 
    patientName: string, 
    medName: string, 
    alarmId: string 
  } | null>(null);
  
  const snoozeTimers = useRef<Record<string, number>>({});
  const completedAlarmsToday = useRef<Record<string, string>>({});

  // Form States
  const [patientForm, setPatientForm] = useState({ name: '', age: 0, condition: '' });
  const [medForm, setMedForm] = useState({ name: '', dosage: '', schedule: '12:00', stock: 0 });

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  // Alarm Loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeAlarm) return;
      const now = new Date();
      const currentH = now.getHours().toString().padStart(2, '0');
      const currentM = now.getMinutes().toString().padStart(2, '0');
      const timeStr = `${currentH}:${currentM}`;
      const dateStr = now.toLocaleDateString();

      patients.forEach(p => {
        p.medicines.forEach(m => {
          const alarmKey = `${dateStr}-${p.id}-${m.id}-${m.schedule}`;
          if (completedAlarmsToday.current[alarmKey]) return;
          const isScheduledTime = m.schedule === timeStr;
          const snoozeUntil = snoozeTimers.current[alarmKey];
          const isSnoozeOver = snoozeUntil && Date.now() >= snoozeUntil;

          if (isScheduledTime || isSnoozeOver) {
            setActiveAlarm({ 
              patientId: p.id, 
              medId: m.id, 
              patientName: p.name, 
              medName: m.name, 
              alarmId: alarmKey 
            });
            speak(`${t.alarm.title} It is time for ${p.name} to take ${m.name}`);
            if (isSnoozeOver) delete snoozeTimers.current[alarmKey];
          }
        });
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [patients, activeAlarm, lang, t]);

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langCodes: any = { en: 'en-US', ml: 'ml-IN', hi: 'hi-IN', ta: 'ta-IN', kn: 'kn-IN' };
    utterance.lang = langCodes[lang] || 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleAiOnboarding = async () => {
    if (!aiInput.trim()) return;
    setIsAiThinking(true);
    const result = await parseSmartOnboarding(aiInput);
    setIsAiThinking(false);
    if (result) {
      setExtractedData(result);
      speak(t.aiAssistant.success);
    }
  };

  const handleAiMedAdd = async () => {
    if (!aiMedInput.trim()) return;
    setIsAiMedThinking(true);
    const result = await parseSmartMedicine(aiMedInput);
    setIsAiMedThinking(false);
    if (result) {
      setExtractedMedData(result);
      speak(t.aiAssistant.success);
    }
  };

  const handleBuildReport = () => {
    if (!selectedPatient) return;
    setIsReportLoading(true);
    setTimeout(() => {
      const reportContent = `
DOCTOR VISIT REPORT
-------------------
Generated on: ${new Date().toLocaleString()}

PATIENT INFORMATION
Name: ${selectedPatient.name}
Age: ${selectedPatient.age}
Primary Condition: ${selectedPatient.condition}

CURRENT MEDICATIONS
${selectedPatient.medicines.length > 0 
  ? selectedPatient.medicines.map(m => `- ${m.name}: ${m.dosage} (Scheduled at ${m.schedule}). Current Stock: ${m.stock}`).join('\n')
  : 'No medications listed.'}

VISIT NOTES & OBSERVATIONS
${selectedPatient.notes.length > 0
  ? selectedPatient.notes.map(n => `[${new Date(n.timestamp).toLocaleDateString()}] ${n.text}`).join('\n\n')
  : 'No observation notes available.'}

-------------------
End of Report
      `;
      setReport(reportContent);
      setIsReportLoading(false);
    }, 800);
  };

  const confirmAiPatient = () => {
    if (!extractedData) return;
    const newPatient: Patient = { 
      id: Math.random().toString(36).substr(2, 9),
      name: extractedData.name,
      age: extractedData.age,
      condition: extractedData.condition,
      medicines: [],
      notes: [],
      createdAt: Date.now()
    };
    setPatients(prev => [...prev, newPatient]);
    setAiOnboardingMode(false);
    setAiInput("");
    setExtractedData(null);
    speak(t.messages.added);
  };

  const confirmAiMed = () => {
    if (!extractedMedData || !selectedPatientId) return;
    const newMed: Medicine = {
      id: Math.random().toString(36).substr(2, 9),
      name: extractedMedData.name || "Unknown",
      dosage: extractedMedData.dosage || "N/A",
      schedule: extractedMedData.schedule || "12:00",
      stock: extractedMedData.stock || 30
    };
    setPatients(prev => prev.map(p => 
      p.id === selectedPatientId ? { ...p, medicines: [...p.medicines, newMed] } : p
    ));
    setAiMedMode(false);
    setAiMedInput("");
    setExtractedMedData(null);
    speak(t.messages.added);
  };

  const addNote = () => {
    if (!noteInput.trim() || !selectedPatientId) return;
    const newNote: PatientNote = {
      id: Math.random().toString(36).substr(2, 9),
      text: noteInput,
      timestamp: Date.now()
    };
    setPatients(prev => prev.map(p => 
      p.id === selectedPatientId ? { ...p, notes: [newNote, ...p.notes] } : p
    ));
    setNoteInput("");
    speak(t.messages.noteSaved);
  };

  const markAsTaken = () => {
    if (!activeAlarm) return;
    const { patientId, medId, alarmId } = activeAlarm;
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          medicines: p.medicines.map(m => {
            if (m.id === medId) {
              const newStock = Math.max(0, m.stock - 1);
              return { ...m, stock: newStock, lastTaken: Date.now() };
            }
            return m;
          })
        };
      }
      return p;
    }));
    completedAlarmsToday.current[alarmId] = new Date().toLocaleTimeString();
    delete snoozeTimers.current[alarmId];
    setActiveAlarm(null);
    speak(t.messages.medTaken);
  };

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    const newPatient: Patient = { 
      ...patientForm, 
      id: Math.random().toString(36).substr(2, 9), 
      medicines: [], 
      notes: [],
      createdAt: Date.now() 
    };
    setPatients(prev => [...prev, newPatient]);
    setPatientForm({ name: '', age: 0, condition: '' });
    speak(t.messages.added);
  };

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    const newMed: Medicine = { ...medForm, id: Math.random().toString(36).substr(2, 9) };
    setPatients(prev => prev.map(p => 
      p.id === selectedPatientId ? { ...p, medicines: [...p.medicines, newMed] } : p
    ));
    setMedForm({ name: '', dosage: '', schedule: '12:00', stock: 0 });
    speak(t.messages.added);
  };

  const openWorkspace = (id: string) => {
    setSelectedPatientId(id);
    setActivePage('workspace');
    setReport(null);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-12">
      {/* Alarm Overlay */}
      {activeAlarm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl text-center">
            <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <i className="fa-solid fa-bell text-5xl"></i>
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">{t.alarm.title}</h2>
            <p className="text-gray-500 mb-8">{t.alarm.dueNow} <span className="text-indigo-600 font-bold">{activeAlarm.medName}</span> for <span className="text-indigo-600 font-bold">{activeAlarm.patientName}</span></p>
            <div className="space-y-4">
              <button onClick={markAsTaken} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3">
                <i className="fa-solid fa-check-double"></i> {t.alarm.taken}
              </button>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => { snoozeTimers.current[activeAlarm.alarmId] = Date.now() + 5 * 60 * 1000; setActiveAlarm(null); }} className="py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all">
                  <i className="fa-solid fa-clock mr-2"></i> {t.alarm.snooze}
                </button>
                <button onClick={() => { completedAlarmsToday.current[activeAlarm.alarmId] = "dismissed"; setActiveAlarm(null); }} className="py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all">
                  <i className="fa-solid fa-stop mr-2"></i> {t.alarm.stop}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="glass-morphism sticky top-0 z-50 py-5 px-6 shadow-sm border-b border-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActivePage('dashboard')}>
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100 text-white font-black text-2xl">Z</div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Zaathi</h1>
              <p className="text-xs text-indigo-600 font-bold tracking-widest uppercase">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex bg-white/50 p-1 rounded-xl border border-gray-100">
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => setLang(l.code)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${lang === l.code ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-indigo-600'}`}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-10">
        {activePage === 'dashboard' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <button onClick={() => setActivePage('patients')} className="group p-8 bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-indigo-50/50 text-left transition-all hover:-translate-y-2">
                <div className="w-16 h-16 bg-blue-500 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-users text-2xl"></i>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">{t.nav.patients}</h3>
                <p className="text-slate-500">{t.nav.patientsDesc}</p>
              </button>
              <div className="p-8 bg-indigo-600 rounded-[2rem] text-white shadow-2xl shadow-indigo-200">
                 <p className="text-indigo-100 font-bold mb-2 uppercase tracking-widest text-xs">Overview</p>
                 <div className="flex items-end gap-2 mb-6">
                    <span className="text-6xl font-black leading-none">{patients.length}</span>
                    <span className="text-xl font-bold pb-1 opacity-70">{t.stats.patients}</span>
                 </div>
                 <div className="flex gap-4">
                    <div className="flex-1 bg-white/10 p-4 rounded-2xl">
                       <p className="text-xs opacity-60 mb-1">Meds Tracked</p>
                       <p className="text-xl font-bold">{patients.reduce((acc, p) => acc + p.medicines.length, 0)}</p>
                    </div>
                    <div className="flex-1 bg-white/10 p-4 rounded-2xl hover:bg-white/20 cursor-pointer" onClick={() => setActivePage('alerts')}>
                       <p className="text-xs opacity-60 mb-1">Alerts</p>
                       <p className="text-xl font-bold">{alerts.length}</p>
                    </div>
                 </div>
              </div>
            </div>
            
            <h2 className="text-3xl font-black text-slate-800 mb-8">Recent Patients</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {patients.map(p => (
                 <div key={p.id} onClick={() => openWorkspace(p.id)} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl cursor-pointer transition-all">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4 text-slate-400">
                      <i className="fa-solid fa-user"></i>
                    </div>
                    <h4 className="font-bold text-slate-800 text-lg">{p.name}</h4>
                    <p className="text-sm text-slate-500">{p.medicines.length} Meds | {p.notes.length} Notes</p>
                 </div>
               ))}
               {patients.length === 0 && (
                 <div className="col-span-full py-12 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
                   <p className="text-gray-400 font-bold">No patients registered yet. Start by adding one.</p>
                 </div>
               )}
            </div>
          </div>
        )}

        {activePage === 'patients' && (
          <div className="animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-10">
               <button onClick={() => setActivePage('dashboard')} className="flex items-center gap-2 text-indigo-600 font-black hover:bg-white px-4 py-2 rounded-xl transition-all">
                <i className="fa-solid fa-arrow-left"></i> Back
               </button>
               <h2 className="text-3xl font-black text-slate-900">Manage Patients</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
                  <h3 className="text-xl font-black text-slate-800 mb-8">Register New Patient</h3>
                  <form onSubmit={handleAddPatient}>
                    <VoiceInput id="pN" label={t.form.name} value={patientForm.name} lang={lang} required onChange={val => setPatientForm(prev => ({...prev, name: val}))} />
                    <VoiceInput id="pA" label={t.form.age} type="number" disableVoice={true} value={patientForm.age} lang={lang} required onChange={val => setPatientForm(prev => ({...prev, age: val}))} />
                    <VoiceInput id="pC" label={t.form.condition} type="textarea" value={patientForm.condition} lang={lang} onChange={val => setPatientForm(prev => ({...prev, condition: val}))} />
                    <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 mt-4 transition-all">
                      Create Profile
                    </button>
                  </form>
                </div>

                <div className={`p-1 rounded-[2.5rem] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all ${aiOnboardingMode ? 'scale-105' : 'opacity-90'}`}>
                  <div className="bg-white p-10 rounded-[2.4rem]">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center gap-2">
                        <i className="fa-solid fa-wand-magic-sparkles"></i> {t.aiAssistant.title}
                      </h3>
                      {!aiOnboardingMode && (
                        <button onClick={() => setAiOnboardingMode(true)} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm">
                          Start Assistant
                        </button>
                      )}
                    </div>

                    {aiOnboardingMode ? (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">{t.aiAssistant.instruction}</p>
                        <VoiceInput 
                          id="aiOn" 
                          label="Patient Description" 
                          type="textarea" 
                          value={aiInput} 
                          lang={lang} 
                          placeholder={t.aiAssistant.placeholder}
                          onChange={setAiInput} 
                        />
                        
                        {isAiThinking && (
                          <div className="flex items-center gap-3 text-indigo-600 font-bold animate-pulse py-4">
                            <i className="fa-solid fa-spinner fa-spin"></i> {t.aiAssistant.thinking}
                          </div>
                        )}

                        {extractedData ? (
                          <div className="bg-slate-50 p-6 rounded-3xl border-2 border-indigo-100 mb-4 animate-in slide-in-from-top-2">
                            <p className="text-sm font-bold text-indigo-600 uppercase mb-2">Review Details:</p>
                            <p className="text-lg font-black text-slate-800">{extractedData.name}</p>
                            <p className="text-sm text-slate-500">Age: {extractedData.age} | Condition: {extractedData.condition}</p>
                            <div className="flex gap-2 mt-4">
                              <button onClick={confirmAiPatient} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-100">
                                {t.aiAssistant.confirm}
                              </button>
                              <button onClick={() => setExtractedData(null)} className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold">
                                {t.aiAssistant.cancel}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                             <button 
                              onClick={handleAiOnboarding} 
                              disabled={!aiInput || isAiThinking}
                              className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 disabled:opacity-50"
                            >
                              {t.aiAssistant.btn}
                            </button>
                            <button onClick={() => setAiOnboardingMode(false)} className="px-6 py-4 bg-slate-100 text-slate-400 rounded-2xl font-bold">
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm font-medium">Use the AI to register patients by just describing them naturally.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                 <h3 className="text-xl font-black text-slate-800 mb-6">Patient Directory</h3>
                 {patients.map(p => (
                   <div key={p.id} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center group hover:border-indigo-200 transition-all">
                      <div className="flex gap-4 items-center">
                         <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-xl">{p.name[0]}</div>
                         <div>
                            <h4 className="font-bold text-slate-800 text-lg">{p.name}</h4>
                            <p className="text-sm text-slate-500">Age: {p.age} • {p.condition.substring(0, 30)}...</p>
                         </div>
                      </div>
                      <button onClick={() => openWorkspace(p.id)} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all">
                        Workspace
                      </button>
                   </div>
                 ))}
                 {patients.length === 0 && <p className="text-slate-400 italic text-center py-10">No patients registered.</p>}
              </div>
            </div>
          </div>
        )}

        {activePage === 'workspace' && selectedPatient && (
          <div className="animate-in fade-in zoom-in-95 duration-400">
            <div className="flex justify-between items-center mb-10">
               <button onClick={() => setActivePage('dashboard')} className="flex items-center gap-2 text-indigo-600 font-black">
                <i className="fa-solid fa-arrow-left"></i> Home
               </button>
               <div className="text-center">
                  <h2 className="text-4xl font-black text-slate-900">{selectedPatient.name}</h2>
                  <p className="text-slate-500 font-bold tracking-widest uppercase text-xs mt-1">{t.workspace.title}</p>
               </div>
               <div className="w-24"></div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
               {/* Left: Notes and Med List */}
               <div className="xl:col-span-2 space-y-10">
                  
                  {/* Notes Section */}
                  <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
                    <h3 className="text-2xl font-black text-slate-800 mb-6">{t.workspace.notesTitle}</h3>
                    <div className="mb-6">
                      <VoiceInput 
                        id="noteAdd" 
                        label={t.workspace.addNote} 
                        type="textarea" 
                        value={noteInput} 
                        lang={lang} 
                        placeholder={t.workspace.notePlaceholder}
                        onChange={setNoteInput} 
                      />
                      <button 
                        onClick={addNote}
                        disabled={!noteInput.trim()}
                        className="mt-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all disabled:opacity-50"
                      >
                        {t.workspace.addNote}
                      </button>
                    </div>

                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {selectedPatient.notes.length === 0 && <p className="text-slate-400 italic">{t.workspace.noNotes}</p>}
                      {selectedPatient.notes.map(note => (
                        <div key={note.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-slate-700 font-medium mb-1">{note.text}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(note.timestamp).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Medicines List */}
                  <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
                     <h3 className="text-2xl font-black text-slate-800 mb-8">{t.workspace.medList}</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedPatient.medicines.length === 0 && <p className="text-slate-400 italic">{t.workspace.noMeds}</p>}
                        {selectedPatient.medicines.map(m => (
                           <div key={m.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex gap-4 items-start relative overflow-hidden">
                              {m.stock < 5 && <div className="absolute top-0 right-0 px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-tighter transform rotate-45 translate-x-4 translate-y-2">Low Stock</div>}
                              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                                 <i className="fa-solid fa-prescription-bottle-medical"></i>
                              </div>
                              <div className="flex-1">
                                 <h4 className="font-bold text-slate-800 text-lg">{m.name}</h4>
                                 <p className="text-sm text-slate-500 mb-3">{m.dosage} • Daily at <span className="text-indigo-600 font-bold">{m.schedule}</span></p>
                                 <div className="flex justify-between items-center">
                                    <span className={`text-xs font-bold ${m.stock < 5 ? 'text-red-500' : 'text-slate-400'}`}>Stock: {m.stock}</span>
                                    {m.lastTaken && (
                                      <span className="text-[10px] text-emerald-600 font-bold">Last: {new Date(m.lastTaken).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    )}
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Built-in Report Builder */}
                  <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
                     <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-black text-slate-800">{t.workspace.summary}</h3>
                        <button 
                          onClick={handleBuildReport} 
                          disabled={isReportLoading}
                          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
                        >
                          {isReportLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-file-waveform"></i>}
                          {t.workspace.generateSummary}
                        </button>
                     </div>
                     {isReportLoading && <p className="text-indigo-600 font-bold animate-pulse text-center py-10">{t.messages.summaryLoading}</p>}
                     {report && (
                       <div className="bg-slate-900 text-emerald-400 p-8 rounded-3xl border border-slate-800 font-mono text-sm whitespace-pre-wrap leading-relaxed shadow-inner">
                          {report}
                          <button 
                            className="mt-4 block text-xs bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1 rounded border border-emerald-500/30"
                            onClick={() => { navigator.clipboard.writeText(report); speak("Report copied to clipboard"); }}
                          >
                            <i className="fa-solid fa-copy mr-1"></i> Copy to Clipboard
                          </button>
                       </div>
                     )}
                  </div>
               </div>

               {/* Right: Add Med Section with AI */}
               <div className="space-y-6 sticky top-32">
                 {/* AI Med Assistant */}
                 <div className="p-1 rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600">
                    <div className="bg-white p-8 rounded-[2.4rem]">
                      <h3 className="text-xl font-black text-indigo-600 mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-sparkles"></i> {t.aiAssistant.medTitle}
                      </h3>
                      {!aiMedMode ? (
                        <button onClick={() => setAiMedMode(true)} className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold">
                          Start Med Assistant
                        </button>
                      ) : (
                        <div className="space-y-4 animate-in fade-in duration-300">
                          <VoiceInput 
                            id="aiMedIn" 
                            label="Describe Medicine" 
                            type="textarea" 
                            value={aiMedInput} 
                            lang={lang} 
                            placeholder={t.aiAssistant.medPlaceholder}
                            onChange={setAiMedInput} 
                          />
                          {isAiMedThinking && <p className="text-xs text-indigo-600 font-bold animate-pulse"><i className="fa-solid fa-spinner fa-spin mr-2"></i>{t.aiAssistant.thinking}</p>}
                          
                          {extractedMedData ? (
                            <div className="bg-slate-50 p-4 rounded-2xl border-2 border-indigo-100 text-sm">
                              <p className="font-black text-slate-800">{extractedMedData.name} - {extractedMedData.dosage}</p>
                              <p className="text-slate-500">Schedule: {extractedMedData.schedule} | Stock: {extractedMedData.stock}</p>
                              <div className="flex gap-2 mt-4">
                                <button onClick={confirmAiMed} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold">
                                  Save
                                </button>
                                <button onClick={() => setExtractedMedData(null)} className="px-4 py-2 bg-slate-100 text-slate-400 rounded-lg font-bold">
                                  Reset
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button 
                                onClick={handleAiMedAdd} 
                                disabled={!aiMedInput || isAiMedThinking}
                                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold disabled:opacity-50"
                              >
                                {t.aiAssistant.btn}
                              </button>
                              <button onClick={() => setAiMedMode(false)} className="px-4 py-3 bg-slate-100 text-slate-400 rounded-xl font-bold">
                                Close
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                 </div>

                 {/* Manual Form */}
                 <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
                    <h3 className="text-2xl font-black text-slate-800 mb-8">{t.workspace.addMed}</h3>
                    <form onSubmit={handleAddMedicine} className="space-y-6">
                      <VoiceInput id="mN" label={t.form.medName} value={medForm.name} lang={lang} required onChange={val => setMedForm(prev => ({...prev, name: val}))} />
                      <VoiceInput id="mD" label={t.form.dosage} value={medForm.dosage} lang={lang} required onChange={val => setMedForm(prev => ({...prev, dosage: val}))} />
                      <ClockPicker label={t.form.schedule} value={medForm.schedule} onChange={val => setMedForm(prev => ({...prev, schedule: val}))} />
                      <VoiceInput id="mS" label={t.form.stock} type="number" disableVoice={true} value={medForm.stock} lang={lang} required onChange={val => setMedForm(prev => ({...prev, stock: val}))} />
                      <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-xl transition-all">
                        {t.form.add}
                      </button>
                    </form>
                 </div>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
