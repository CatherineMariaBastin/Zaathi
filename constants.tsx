
import { Language } from './types';

export const LANGUAGES = [
  { code: 'en' as Language, label: 'English' },
  { code: 'ml' as Language, label: 'മലയാളം' },
  { code: 'hi' as Language, label: 'हिन्दी' },
  { code: 'ta' as Language, label: 'தமிழ்' },
  { code: 'kn' as Language, label: 'ಕನ್ನಡ' },
];

// Use Partial to allow missing translations for languages defined in the Language type
export const TRANSLATIONS: Partial<Record<Language, any>> = {
  en: {
    subtitle: 'Caregiver Companion',
    stats: { patients: 'Patients', medicines: 'Active Meds', alerts: 'Alerts' },
    nav: {
      dashboard: 'Dashboard',
      patients: 'Select Patient',
      patientsDesc: 'Open workspace for a patient',
      medicines: 'Meds',
      alerts: 'Notifications',
    },
    aiAssistant: {
      title: 'AI Smart Register',
      placeholder: 'Tell me about the patient... e.g., "John is 45 years old and has high blood pressure"',
      medTitle: 'AI Smart Med Add',
      medPlaceholder: 'e.g., "Add Paracetamol 500mg daily at 8am, we have 20 tablets"',
      btn: 'Process with AI',
      confirm: 'Confirm & Save',
      cancel: 'Start Over',
      success: 'Information extracted!',
      thinking: 'Analyzing...',
      instruction: 'Click the mic and describe the details.'
    },
    workspace: {
      title: 'Patient Workspace',
      summary: 'Report Builder',
      generateSummary: 'Build Report',
      addMed: 'Add Medicine',
      medList: 'Prescribed Medicines',
      noMeds: 'No medicines added yet.',
      notesTitle: 'Doctor Visit Notes',
      addNote: 'Record Note',
      notePlaceholder: 'Type or use voice to record doctor observations...',
      noNotes: 'No notes recorded for this patient.',
    },
    alarm: {
      title: 'Medicine Alarm!',
      dueNow: 'It is time for:',
      stop: 'Stop',
      snooze: 'Snooze (5m)',
      taken: 'Mark as Taken',
    },
    form: {
      name: 'Patient Name',
      age: 'Age',
      condition: 'Medical History',
      medName: 'Medicine',
      dosage: 'Dosage',
      schedule: 'Time',
      stock: 'Stock',
      add: 'Add to Record',
    },
    messages: {
      added: 'Successfully added',
      summaryLoading: 'Assembling report data...',
      lowStock: 'Low Stock Alert!',
      outOfStock: 'Out of Stock Alert!',
      medTaken: 'Dose recorded. Stock updated.',
      noteSaved: 'Note saved successfully.',
    }
  },
  ml: {
    subtitle: 'കെയർഗിവർ സഹായി',
    stats: { patients: 'രോഗികൾ', medicines: 'മരുന്നുകൾ', alerts: 'അറിയിപ്പുകൾ' },
    nav: {
      dashboard: 'ഡാഷ്ബോർഡ്',
      patients: 'രോഗിയെ തിരഞ്ഞെടുക്കുക',
      patientsDesc: 'രോഗിക്കായി വർക്ക്സ്പേസ് തുറക്കുക',
      medicines: 'മരുന്നുകൾ',
      alerts: 'അറിയിപ്പുകൾ',
    },
    aiAssistant: {
      title: 'AI സ്മാർട്ട് രജിസ്റ്റർ',
      placeholder: 'രോഗിയെക്കുറിച്ച് പറയൂ...',
      medTitle: 'AI സ്മാർട്ട് മെഡിസിൻ',
      medPlaceholder: 'മരുന്നിനെക്കുറിച്ച് പറയൂ...',
      btn: 'AI ഉപയോഗിച്ച് പ്രോസസ്സ് ചെയ്യുക',
      confirm: 'സ്ഥിരീകരിക്കുക',
      cancel: 'മാറ്റുക',
      success: 'വിവരങ്ങൾ ശേഖരിച്ചു!',
      thinking: 'പരിശോധിക്കുന്നു...',
      instruction: 'മൈക്ക് ഉപയോഗിച്ച് വിവരങ്ങൾ നൽകുക.'
    },
    workspace: {
      title: 'രോഗിയുടെ വർക്ക് സ്പേസ്',
      summary: 'റിപ്പോർട്ട് ബിൽഡർ',
      generateSummary: 'റിപ്പോർട്ട് തയ്യാറാക്കുക',
      addMed: 'പുതിയ മരുന്ന് ചേർക്കുക',
      medList: 'നിർദ്ദേശിച്ച മരുന്നുകൾ',
      noMeds: 'മരുന്നുകളൊന്നും ചേർത്തിട്ടില്ല.',
      notesTitle: 'ഡോക്ടർ കുറിപ്പുകൾ',
      addNote: 'കുറിപ്പ് ചേർക്കുക',
      notePlaceholder: 'ഡോക്ടറുടെ നിർദ്ദേശങ്ങൾ രേഖപ്പെടുത്തുക...',
      noNotes: 'കുറിപ്പുകളൊന്നുമില്ല.',
    },
    alarm: {
      title: 'മരുന്ന് സമയം!',
      dueNow: 'സമയമായി:',
      stop: 'നിർത്തുക',
      snooze: 'സ്നൂസ് (5മി)',
      taken: 'മരുന്ന് നൽകി',
    },
    form: {
      name: 'രോഗിയുടെ പേര്',
      age: 'പ്രായം',
      condition: 'രോഗവിവരങ്ങൾ',
      medName: 'മരുന്ന്',
      dosage: 'അളവ്',
      schedule: 'സമയം',
      stock: 'സ്റ്റോക്ക്',
      add: 'ചേർക്കുക',
    },
    messages: {
      added: 'വിജയകരമായി ചേർത്തു',
      summaryLoading: 'റിപ്പോർട്ട് തയ്യാറാക്കുന്നു...',
      lowStock: 'സ്റ്റോക്ക് കുറവാണ്!',
      outOfStock: 'സ്റ്റോക്ക് തീർന്നു!',
      medTaken: 'മരുന്ന് നൽകിയതായി രേഖപ്പെടുത്തി.',
      noteSaved: 'കുറിപ്പ് സംരക്ഷിച്ചു.',
    }
  }
};
