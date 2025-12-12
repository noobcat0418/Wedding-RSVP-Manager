import { useState } from 'react';
import Papa from 'papaparse';

const defaultQuestions = [
  { id: 'attending', type: 'radio', label: 'Will you be attending?', required: true, options: ['Joyfully Accept', 'Regretfully Decline', 'Not Sure Yet'], editable: false },
  { id: 'plusOne', type: 'radio', label: 'Will you bring a plus one?', required: false, options: ['Yes', 'No'], editable: true },
  { id: 'plusOneName', type: 'text', label: "Plus One's Name", required: false, editable: true },
  { id: 'dietaryRestrictions', type: 'text', label: 'Dietary Restrictions / Allergies', required: false, editable: true },
  { id: 'message', type: 'textarea', label: 'Message for the Couple', required: false, editable: true },
];

const weddingColors = [
  { name: 'Rose', primary: '#e11d48', light: '#ffe4e6' },
  { name: 'Purple', primary: '#7c3aed', light: '#ede9fe' },
  { name: 'Blue', primary: '#2563eb', light: '#dbeafe' },
  { name: 'Teal', primary: '#0d9488', light: '#ccfbf1' },
  { name: 'Green', primary: '#16a34a', light: '#dcfce7' },
  { name: 'Orange', primary: '#ea580c', light: '#ffedd5' },
  { name: 'Pink', primary: '#db2777', light: '#fce7f3' },
  { name: 'Indigo', primary: '#4f46e5', light: '#e0e7ff' },
];

const fontStyles = [
  { name: 'Elegant Serif', value: 'serif', style: { fontFamily: 'Georgia, serif' } },
  { name: 'Modern Sans', value: 'sans', style: { fontFamily: 'Arial, sans-serif' } },
  { name: 'Romantic', value: 'cursive', style: { fontFamily: 'cursive' } },
  { name: 'Classic', value: 'times', style: { fontFamily: 'Times New Roman, serif' } },
];

const createWedding = () => {
  const id = Date.now().toString();
  const rsvpId = `${id.slice(-6)}${Math.random().toString(36).substring(2, 6)}`.toUpperCase();
  return {
    id, rsvpId,
    rsvpLink: `https://yourdomain.com/rsvp/${rsvpId}`,
    futureWife: '', futureHusband: '', coupleName: '',
    weddingDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    weddingTime: '16:00', venueInfo: '', venueAddress: '',
    color: weddingColors[Math.floor(Math.random() * weddingColors.length)],
    customization: { 
      primaryColor: '#e11d48', secondaryColor: '#be185d', 
      bgStart: '#fff1f2', bgEnd: '#fce7f3', bgPhoto: '', fontStyle: 'serif',
      headerText: 'You Are Cordially Invited To The Wedding Of',
      footerText: 'We can\'t wait to celebrate with you!',
      rsvpTitle: 'Please RSVP',
      rsvpSubtitle: 'Let us know if you can make it',
      thankYouTitle: 'Thank You!',
      thankYouMessage: 'Your RSVP has been submitted. We look forward to celebrating with you!'
    },
    questions: [...defaultQuestions],
    emailTemplate: { 
      subject: "You're Invited! 💕 {{couple}}'s Wedding", 
      body: "Dear {{name}},\n\nWe are delighted to invite you to celebrate our wedding!\n\n📅 Date: {{date}}\n⏰ Time: {{time}}\n📍 Venue: {{venue}}\n\nPlease RSVP using the link below:\n{{rsvpLink}}\n\nWe can't wait to celebrate with you!\n\nWith love,\n{{couple}}" 
    },
    smsTemplate: { body: "Hi {{name}}! 💕 You're invited to {{couple}}'s wedding on {{date}} at {{venue}}. Please RSVP here: {{rsvpLink}}" },
    guests: [], createdAt: new Date().toISOString()
  };
};

const getGuestStatus = (g) => {
  if (g.attending) return g.attending;
  if (g.linkClicked) return 'Viewed Form';
  if (g.emailSent || g.smsSent) return 'Invited';
  return 'Not Invited';
};

const getStatusColor = (s) => ({ 'Joyfully Accept': 'bg-emerald-100 text-emerald-700', 'Regretfully Decline': 'bg-red-100 text-red-700', 'Not Sure Yet': 'bg-amber-100 text-amber-700', 'Viewed Form': 'bg-blue-100 text-blue-700', 'Invited': 'bg-cyan-100 text-cyan-700', 'Not Invited': 'bg-gray-100 text-gray-600' }[s] || 'bg-gray-100 text-gray-600');
const getStatusEmoji = (s) => ({ 'Joyfully Accept': '✅', 'Regretfully Decline': '❌', 'Not Sure Yet': '🤔', 'Viewed Form': '👀', 'Invited': '📤', 'Not Invited': '⏳' }[s] || '❓');

const getStats = (w) => {
  if (!w) return { total: 0, yes: 0, no: 0, maybe: 0, plusOnes: 0, notInvited: 0, responded: 0 };
  const g = w.guests;
  return { total: g.length, yes: g.filter(x => x.attending === 'Joyfully Accept').length, no: g.filter(x => x.attending === 'Regretfully Decline').length,
    maybe: g.filter(x => x.attending === 'Not Sure Yet').length, plusOnes: g.filter(x => x.plusOne === 'Yes' && x.attending === 'Joyfully Accept').length,
    notInvited: g.filter(x => !x.emailSent && !x.smsSent).length, responded: g.filter(x => x.attending).length };
};

const getWeddingStatus = (w) => {
  const days = Math.ceil((new Date(w.weddingDate) - new Date()) / (1000 * 60 * 60 * 24));
  if (days < 0) return 'Completed';
  if (days <= 7) return 'This Week';
  if (days <= 30) return 'This Month';
  return 'Upcoming';
};

export default function WeddingRSVP() {
  const [weddings, setWeddings] = useState([createWedding()]);
  const [activeWeddingId, setActiveWeddingId] = useState(null);
  const [view, setView] = useState('list');
  const [tab, setTab] = useState('overview');
  const [customizeSection, setCustomizeSection] = useState('theme');
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [newGuest, setNewGuest] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [filter, setFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [weddingView, setWeddingView] = useState('cards');
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ label: '', type: 'text', options: '', required: false });
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [rsvpMode, setRsvpMode] = useState(null);
  const [rsvpStep, setRsvpStep] = useState('select');
  const [rsvpSelectedGuest, setRsvpSelectedGuest] = useState(null);
  const [rsvpFormData, setRsvpFormData] = useState({});
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpSearch, setRsvpSearch] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState([]);
  const [importMapping, setImportMapping] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [importColumns, setImportColumns] = useState([]);
  const [importError, setImportError] = useState('');
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendType, setSendType] = useState('email');
  const [selectedGuests, setSelectedGuests] = useState([]);
  const [sendSuccess, setSendSuccess] = useState(null);

  const activeWedding = weddings.find(w => w.id === activeWeddingId);
  const cust = activeWedding?.customization || {};

  const personalizeTemplate = (template, wedding, guest) => {
    if (!wedding) return template;
    return template
      .replace(/\{\{name\}\}/g, guest?.name || guest?.firstName || '[Guest Name]')
      .replace(/\{\{couple\}\}/g, wedding.coupleName || '[Couple]')
      .replace(/\{\{date\}\}/g, new Date(wedding.weddingDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }))
      .replace(/\{\{time\}\}/g, wedding.weddingTime || '[Time]')
      .replace(/\{\{venue\}\}/g, wedding.venueInfo || '[Venue]')
      .replace(/\{\{rsvpLink\}\}/g, wedding.rsvpLink || '[RSVP Link]');
  };

  const updateWedding = (updates) => setWeddings(prev => prev.map(w => w.id === activeWeddingId ? { ...w, ...updates } : w));
  const updateCust = (k, v) => updateWedding({ customization: { ...activeWedding.customization, [k]: v } });

  const addGuest = () => {
    if (!activeWedding) return;
    if (!newGuest.firstName && !newGuest.lastName) return;
    const guestId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    const name = `${newGuest.firstName} ${newGuest.lastName}`.trim();
    const newGuestData = { id: guestId, name, firstName: newGuest.firstName, lastName: newGuest.lastName, email: newGuest.email, phone: newGuest.phone, createdAt: new Date().toISOString() };
    setWeddings(prev => prev.map(w => w.id === activeWeddingId ? { ...w, guests: [...w.guests, newGuestData] } : w));
    setNewGuest({ firstName: '', lastName: '', email: '', phone: '' }); 
    setShowAddGuest(false);
  };

  const deleteGuest = (guestId) => {
    updateWedding({ guests: activeWedding.guests.filter(g => g.id !== guestId) });
    setSelectedGuests(prev => prev.filter(id => id !== guestId));
  };

  const addQuestion = () => {
    if (!newQuestion.label) return;
    const q = { id: `custom_${Date.now()}`, ...newQuestion, options: newQuestion.type === 'select' || newQuestion.type === 'radio' ? newQuestion.options.split(',').map(o => o.trim()).filter(o => o) : undefined, editable: true };
    updateWedding({ questions: [...activeWedding.questions, q] });
    setNewQuestion({ label: '', type: 'text', options: '', required: false }); setShowAddQuestion(false);
  };

  const deleteQuestion = (qId) => updateWedding({ questions: activeWedding.questions.filter(q => q.id !== qId) });
  const startEditQuestion = (q) => { setEditingQuestionId(q.id); setEditingQuestion({ ...q, options: Array.isArray(q.options) ? q.options.join(', ') : '' }); };
  
  const saveEditQuestion = () => {
    if (!editingQuestion?.label) return;
    const updatedQ = { ...editingQuestion, options: editingQuestion.type === 'select' || editingQuestion.type === 'radio' ? editingQuestion.options.split(',').map(o => o.trim()).filter(o => o) : undefined };
    updateWedding({ questions: activeWedding.questions.map(q => q.id === editingQuestionId ? updatedQ : q) });
    setEditingQuestionId(null); setEditingQuestion(null);
  };

  const handleBgPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateCust('bgPhoto', reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError('');
    Papa.parse(file, {
      header: true, skipEmptyLines: true, dynamicTyping: true,
      complete: (results) => {
        if (results.data?.length > 0) {
          const cols = Object.keys(results.data[0]).map(c => c.trim());
          setImportColumns(cols); setImportData(results.data); autoMapColumns(cols);
        } else setImportError('No data found in file');
      },
      error: (err) => setImportError('Error parsing file: ' + err.message)
    });
  };

  const autoMapColumns = (cols) => {
    const lower = cols.map(c => c.toLowerCase());
    setImportMapping({
      firstName: cols[lower.findIndex(c => c.includes('first') && c.includes('name'))] || cols[lower.findIndex(c => c === 'firstname')] || '',
      lastName: cols[lower.findIndex(c => c.includes('last') && c.includes('name'))] || cols[lower.findIndex(c => c === 'lastname')] || '',
      email: cols[lower.findIndex(c => c.includes('email'))] || '',
      phone: cols[lower.findIndex(c => c.includes('phone') || c.includes('mobile'))] || ''
    });
  };

  const confirmImport = () => {
    if (!importMapping.firstName && !importMapping.lastName) { setImportError('Please map at least First Name or Last Name'); return; }
    const newGuests = importData.filter(row => row[importMapping.firstName]?.toString().trim() || row[importMapping.lastName]?.toString().trim()).map(row => {
      const firstName = importMapping.firstName ? String(row[importMapping.firstName] || '').trim() : '';
      const lastName = importMapping.lastName ? String(row[importMapping.lastName] || '').trim() : '';
      return { id: Date.now().toString() + Math.random().toString(36).substr(2, 9), firstName, lastName, name: `${firstName} ${lastName}`.trim(), email: importMapping.email ? String(row[importMapping.email] || '').trim() : '', phone: importMapping.phone ? String(row[importMapping.phone] || '').trim() : '', createdAt: new Date().toISOString() };
    });
    if (newGuests.length === 0) { setImportError('No valid guests found'); return; }
    updateWedding({ guests: [...activeWedding.guests, ...newGuests] });
    setShowImportModal(false); setImportData([]); setImportColumns([]); setImportMapping({ firstName: '', lastName: '', email: '', phone: '' }); setImportError('');
  };

  const openRsvpForm = (weddingId) => {
    const wedding = weddings.find(w => w.id === weddingId);
    if (wedding) { setRsvpMode(weddingId); setRsvpStep('select'); setRsvpSelectedGuest(null); setRsvpFormData({}); setRsvpSubmitted(false); setRsvpSearch(''); }
  };

  const selectGuestForRsvp = (guest) => {
    setRsvpSelectedGuest(guest);
    setRsvpStep('form');
    setWeddings(prev => prev.map(w => w.id === rsvpMode ? { ...w, guests: w.guests.map(g => g.id === guest.id ? { ...g, linkClicked: true } : g) } : w));
  };

  const submitRsvpForm = () => {
    if (!rsvpMode || !rsvpSelectedGuest) return;
    setWeddings(prev => prev.map(w => w.id === rsvpMode ? { ...w, guests: w.guests.map(g => g.id === rsvpSelectedGuest.id ? { ...g, ...rsvpFormData, respondedAt: new Date().toISOString() } : g) } : w));
    setRsvpSubmitted(true);
  };

  const copyRsvpLink = (link) => navigator.clipboard.writeText(link).then(() => alert('RSVP link copied!')).catch(() => alert('RSVP Link: ' + link));

  const openSendModal = (type) => {
    setSendType(type);
    const eligibleGuests = activeWedding.guests.filter(g => type === 'email' ? g.email : g.phone);
    setSelectedGuests(eligibleGuests.map(g => g.id));
    setShowSendModal(true);
    setSendSuccess(null);
  };

  const sendInvitations = () => {
    const now = new Date().toISOString();
    updateWedding({ guests: activeWedding.guests.map(g => selectedGuests.includes(g.id) ? { ...g, [sendType === 'email' ? 'emailSent' : 'smsSent']: now } : g) });
    setSendSuccess(`${selectedGuests.length} invitation${selectedGuests.length > 1 ? 's' : ''} sent via ${sendType.toUpperCase()}!`);
    setTimeout(() => { setShowSendModal(false); setSendSuccess(null); }, 2000);
  };

  const deleteWedding = (id) => { setWeddings(prev => prev.filter(w => w.id !== id)); if (activeWeddingId === id) { setActiveWeddingId(null); setView('list'); } setDeleteConfirm(null); };

  const rsvpWedding = rsvpMode ? weddings.find(w => w.id === rsvpMode) : null;
  const filteredGuests = activeWedding?.guests.filter(g => filter === 'all' || getGuestStatus(g) === filter) || [];

  // RSVP Form View
  if (rsvpMode && rsvpWedding) {
    const rc = rsvpWedding.customization || {};
    const rsvpFilteredGuests = rsvpWedding.guests.filter(g => g.name.toLowerCase().includes(rsvpSearch.toLowerCase()));

    if (rsvpSubmitted) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: `linear-gradient(135deg, ${rc.bgStart || '#fff1f2'}, ${rc.bgEnd || '#fce7f3'})` }}>
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{rc.thankYouTitle || 'Thank You!'}</h1>
            <p className="text-gray-600 mb-6">{rc.thankYouMessage || 'Your RSVP has been submitted.'}</p>
            <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: rc.primaryColor + '20' }}>
              <p className="text-lg font-semibold" style={{ color: rc.primaryColor || '#e11d48' }}>{rsvpFormData.attending}</p>
            </div>
            <button onClick={() => setRsvpMode(null)} className="w-full py-3 rounded-xl text-white font-medium" style={{ backgroundColor: rc.primaryColor || '#e11d48' }}>Close</button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${rc.bgStart || '#fff1f2'}, ${rc.bgEnd || '#fce7f3'})` }}>
        <div className="max-w-2xl mx-auto p-4 py-8">
          <button onClick={() => setRsvpMode(null)} className="mb-4 text-sm text-gray-500 hover:text-gray-700">← Back to Manager</button>
          
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-xl overflow-hidden mb-6">
            <div className="p-8 text-center" style={{ backgroundImage: rc.bgPhoto ? `linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.85)), url(${rc.bgPhoto})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <p className="text-sm uppercase tracking-widest mb-3" style={{ color: rc.secondaryColor || '#be185d' }}>{rc.headerText || 'You Are Cordially Invited'}</p>
              <h1 className="text-4xl mb-4" style={{ color: rc.primaryColor || '#e11d48', ...(fontStyles.find(f => f.value === rc.fontStyle)?.style || {}) }}>{rsvpWedding.coupleName || 'Our Wedding'}</h1>
              <div className="flex flex-col md:flex-row justify-center gap-6 text-gray-600 mb-4">
                <div><p className="text-2xl">📅</p><p className="font-medium">{new Date(rsvpWedding.weddingDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p></div>
                <div><p className="text-2xl">📍</p><p className="font-medium">{rsvpWedding.venueInfo || 'Venue TBD'}</p></div>
              </div>
              <p className="text-gray-500 italic">{rc.footerText || "We can't wait to celebrate with you!"}</p>
            </div>
          </div>

          {rsvpStep === 'select' ? (
            <div className="bg-white/95 backdrop-blur rounded-3xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-1">{rc.rsvpTitle || 'Please RSVP'}</h2>
              <p className="text-gray-500 text-sm mb-4">{rc.rsvpSubtitle || 'Find your name to respond'}</p>
              <input value={rsvpSearch} onChange={e => setRsvpSearch(e.target.value)} placeholder="Type your name..." className="w-full px-4 py-3 rounded-xl bg-gray-100 border-0 mb-4 text-lg" />
              <div className="max-h-64 overflow-y-auto space-y-2">
                {rsvpFilteredGuests.length === 0 ? <p className="text-center text-gray-400 py-8">No guests found</p> : rsvpFilteredGuests.map(g => (
                  <button key={g.id} onClick={() => selectGuestForRsvp(g)} className="w-full p-4 rounded-xl text-left hover:bg-gray-50 border border-gray-200 flex justify-between items-center">
                    <div><p className="font-medium text-gray-800">{g.name}</p>{g.email && <p className="text-sm text-gray-400">{g.email}</p>}</div>
                    {g.attending ? <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(g.attending)}`}>{getStatusEmoji(g.attending)} Responded</span> : <span className="text-gray-400">→</span>}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur rounded-3xl shadow-xl p-6">
              <button onClick={() => setRsvpStep('select')} className="text-sm text-gray-500 hover:text-gray-700 mb-4">← Back to guest list</button>
              <h2 className="text-xl font-semibold text-gray-800 mb-1">RSVP for {rsvpSelectedGuest?.name}</h2>
              <p className="text-sm text-gray-500 mb-6">Please let us know if you can make it!</p>
              <div className="space-y-5">
                {rsvpWedding.questions?.map(q => (
                  <div key={q.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{q.label} {q.required && <span className="text-red-500">*</span>}</label>
                    {q.type === 'text' && <input value={rsvpFormData[q.id] || ''} onChange={e => setRsvpFormData(p => ({ ...p, [q.id]: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-gray-100 border-0" />}
                    {q.type === 'textarea' && <textarea value={rsvpFormData[q.id] || ''} onChange={e => setRsvpFormData(p => ({ ...p, [q.id]: e.target.value }))} rows={3} className="w-full px-4 py-3 rounded-xl bg-gray-100 border-0 resize-none" />}
                    {q.type === 'select' && <select value={rsvpFormData[q.id] || ''} onChange={e => setRsvpFormData(p => ({ ...p, [q.id]: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-gray-100 border-0"><option value="">Select...</option>{q.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>}
                    {q.type === 'radio' && <div className="flex flex-wrap gap-2">{q.options?.map(opt => <button key={opt} onClick={() => setRsvpFormData(p => ({ ...p, [q.id]: opt }))} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${rsvpFormData[q.id] === opt ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} style={rsvpFormData[q.id] === opt ? { backgroundColor: rc.primaryColor || '#e11d48' } : {}}>{opt}</button>)}</div>}
                  </div>
                ))}
              </div>
              <button onClick={submitRsvpForm} disabled={!rsvpFormData.attending} className="w-full mt-8 py-4 rounded-xl text-white font-semibold text-lg disabled:opacity-50" style={{ backgroundColor: rc.primaryColor || '#e11d48' }}>Submit RSVP</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Wedding List View
  if (view === 'list' || !activeWedding) {
    const statusColors = { 'Completed': 'bg-gray-100 text-gray-600', 'This Week': 'bg-red-100 text-red-600', 'This Month': 'bg-amber-100 text-amber-600', 'Upcoming': 'bg-blue-100 text-blue-600' };

    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-serif text-gray-800 mb-2">💍 Wedding RSVP Manager</h1>
            <p className="text-gray-500">Manage wedding invitations and track RSVPs</p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 flex flex-wrap gap-3 items-center justify-between border border-gray-200">
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button onClick={() => setWeddingView('cards')} className={`px-2.5 py-1.5 rounded-lg ${weddingView === 'cards' ? 'bg-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`} title="Card View">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="2"/></svg>
              </button>
              <button onClick={() => setWeddingView('table')} className={`px-2.5 py-1.5 rounded-lg ${weddingView === 'table' ? 'bg-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`} title="Table View">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M3 6h18M3 12h18M3 18h18"/></svg>
              </button>
            </div>
            <button onClick={() => setWeddings(prev => [createWedding(), ...prev])} className="px-4 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800">+ New Wedding</button>
          </div>

          {weddings.length === 0 ? (
            <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-200">
              <div className="text-6xl mb-4">💍</div>
              <p className="text-lg text-gray-500">No weddings yet</p>
              <p className="text-sm mt-1">Click "+ New Wedding" above to get started</p>
            </div>
          ) : weddingView === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weddings.map(w => {
                const wStats = getStats(w); const wStatus = getWeddingStatus(w); const wColor = w.color || weddingColors[0];
                return (
                  <div key={w.id} onClick={() => { setActiveWeddingId(w.id); setView('dashboard'); setTab('overview'); }} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-200 cursor-pointer">
                    <div className="h-2" style={{ backgroundColor: wColor.primary }} />
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[wStatus]}`}>{wStatus}</span>
                        <button onClick={e => { e.stopPropagation(); setDeleteConfirm(w.id); }} className="text-gray-300 hover:text-red-400 p-1">🗑️</button>
                      </div>
                      <h3 className="text-lg font-serif text-gray-800">{w.coupleName || 'Unnamed Wedding'}</h3>
                      <p className="text-gray-500 text-sm mt-1">📅 {new Date(w.weddingDate).toLocaleDateString()}</p>
                      <p className="text-gray-400 text-xs truncate">📍 {w.venueInfo || 'No venue set'}</p>
                      <div className="mt-3 p-2 bg-gray-50 rounded-lg" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono text-gray-600 truncate flex-1">{w.rsvpLink}</code>
                          <button onClick={() => copyRsvpLink(w.rsvpLink)} className="text-xs px-2 py-1 bg-white rounded text-gray-600 hover:bg-gray-100 shrink-0">📋</button>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 text-xs">
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">✅ {wStats.yes}</span>
                        <span className="bg-red-50 text-red-500 px-2 py-1 rounded-full">❌ {wStats.no}</span>
                        <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-full">👥 {wStats.total}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200"><tr>{['Couple', 'Date', 'Guests', 'Responded', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {weddings.map(w => {
                    const wStats = getStats(w);
                    return (
                      <tr key={w.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setActiveWeddingId(w.id); setView('dashboard'); setTab('overview'); }}>
                        <td className="px-4 py-3 font-medium text-gray-800">{w.coupleName || 'Unnamed'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{new Date(w.weddingDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm">{wStats.total}</td>
                        <td className="px-4 py-3 text-sm text-emerald-600">{wStats.responded}</td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <div className="flex gap-1">
                            <button onClick={() => copyRsvpLink(w.rsvpLink)} className="p-1.5 text-gray-400 hover:text-blue-500">📋</button>
                            <button onClick={() => openRsvpForm(w.id)} className="p-1.5 text-gray-400 hover:text-green-500">🔗</button>
                            <button onClick={() => setDeleteConfirm(w.id)} className="p-1.5 text-gray-400 hover:text-red-500">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
              <div className="text-center"><div className="text-4xl mb-3">⚠️</div><h3 className="text-lg font-semibold mb-2">Delete Wedding?</h3><p className="text-gray-500 text-sm mb-6">This will permanently delete all data.</p></div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 rounded-xl bg-gray-100 font-medium">Cancel</button>
                <button onClick={() => deleteWedding(deleteConfirm)} className="flex-1 py-2 rounded-xl bg-red-500 text-white font-medium">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Dashboard View
  const stats = getStats(activeWedding);
  const wColor = activeWedding.color || weddingColors[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="h-1" style={{ backgroundColor: wColor.primary }} />
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('list')} className="text-gray-400 hover:text-gray-600 p-2">←</button>
            <div>
              <h1 className="font-serif text-xl text-gray-800">{activeWedding.coupleName || 'Unnamed Wedding'}</h1>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono px-2 py-0.5 bg-gray-100 rounded truncate max-w-xs" style={{ color: wColor.primary }}>{activeWedding.rsvpLink}</code>
                <button onClick={() => copyRsvpLink(activeWedding.rsvpLink)} className="text-xs text-gray-400 hover:text-gray-600">📋</button>
              </div>
            </div>
          </div>
          <button onClick={() => openRsvpForm(activeWedding.id)} className="text-sm px-3 py-1.5 rounded-lg border text-gray-600 hover:bg-gray-50">🔗 Preview RSVP</button>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {[['overview', '📊 Overview'], ['details', '📋 Details'], ['customize', '✨ Customize'], ['guests', '👥 Guests'], ['invitations', '💌 Send Invites']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`px-4 py-3 font-medium text-sm border-b-2 whitespace-nowrap ${tab === k ? 'border-current' : 'border-transparent text-gray-400'}`} style={tab === k ? { color: wColor.primary } : {}}>{l}</button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[['✅', 'bg-emerald-100', 'text-emerald-600', stats.yes, 'Attending'], ['❌', 'bg-red-100', 'text-red-500', stats.no, 'Declined'], ['🤔', 'bg-amber-100', 'text-amber-600', stats.maybe, 'Maybe'], ['👑', wColor.light, wColor.primary, stats.yes + stats.plusOnes, 'Total Attending']].map(([emoji, bg, color, count, label], i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${i < 3 ? bg : ''}`} style={i === 3 ? { backgroundColor: wColor.light } : {}}>{emoji}</div>
                    <div><div className={`text-2xl font-bold ${i < 3 ? color : ''}`} style={i === 3 ? { color: wColor.primary } : {}}>{count}</div><div className="text-sm text-gray-500">{label}</div></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h2 className="font-semibold text-gray-700">👑 Invitation Preview</h2>
                <button onClick={() => setTab('customize')} className="text-sm px-3 py-1.5 rounded-lg bg-white border text-gray-600 hover:bg-gray-100">✏️ Customize</button>
              </div>
              <div style={{ background: `linear-gradient(135deg, ${cust.bgStart || '#fff1f2'}, ${cust.bgEnd || '#fce7f3'})` }}>
                <div className="p-8 text-center" style={{ backgroundImage: cust.bgPhoto ? `linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.85)), url(${cust.bgPhoto})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <p className="text-sm uppercase tracking-widest mb-3" style={{ color: cust.secondaryColor || '#be185d' }}>{cust.headerText || 'You Are Cordially Invited'}</p>
                  <h1 className="text-3xl mb-4" style={{ color: cust.primaryColor || '#e11d48', ...(fontStyles.find(f => f.value === cust.fontStyle)?.style || {}) }}>{activeWedding.coupleName || 'Our Wedding'}</h1>
                  <p className="text-gray-600">📅 {new Date(activeWedding.weddingDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  <p className="text-gray-600">📍 {activeWedding.venueInfo || 'Venue TBD'}</p>
                  <p className="text-gray-500 italic mt-4">{cust.footerText || "We can't wait to celebrate with you!"}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <h2 className="font-semibold text-gray-700 mb-4">🔗 Share RSVP Link</h2>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <code className="text-sm font-mono font-bold flex-1 truncate" style={{ color: wColor.primary }}>{activeWedding.rsvpLink}</code>
                <button onClick={() => copyRsvpLink(activeWedding.rsvpLink)} className="px-4 py-2 bg-white rounded-lg border text-gray-700 hover:bg-gray-100 shrink-0">📋 Copy</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'details' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
            <h2 className="font-semibold text-gray-700 mb-4">📋 Wedding Details</h2>
            <div><label className="text-sm text-gray-500 mb-2 block">Card Color</label><div className="flex flex-wrap gap-2">{weddingColors.map(c => <button key={c.name} onClick={() => updateWedding({ color: c })} className={`w-8 h-8 rounded-full border-2 ${activeWedding.color?.name === c.name ? 'border-gray-800 scale-110' : 'border-gray-200'}`} style={{ backgroundColor: c.primary }} />)}</div></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-gray-500 mb-1 block">👰 Future Wife</label><input value={activeWedding.futureWife} onChange={e => updateWedding({ futureWife: e.target.value, coupleName: `${e.target.value}${activeWedding.futureHusband ? ' & ' + activeWedding.futureHusband : ''}` })} className="w-full px-4 py-2 rounded-xl bg-gray-100 border-0" /></div>
              <div><label className="text-sm text-gray-500 mb-1 block">🤵 Future Husband</label><input value={activeWedding.futureHusband} onChange={e => updateWedding({ futureHusband: e.target.value, coupleName: `${activeWedding.futureWife}${e.target.value ? ' & ' + e.target.value : ''}` })} className="w-full px-4 py-2 rounded-xl bg-gray-100 border-0" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-gray-500 mb-1 block">Date</label><input type="date" value={activeWedding.weddingDate} onChange={e => updateWedding({ weddingDate: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-gray-100 border-0" /></div>
              <div><label className="text-sm text-gray-500 mb-1 block">Time</label><input type="time" value={activeWedding.weddingTime} onChange={e => updateWedding({ weddingTime: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-gray-100 border-0" /></div>
            </div>
            <div><label className="text-sm text-gray-500 mb-1 block">Venue Name</label><input value={activeWedding.venueInfo} onChange={e => updateWedding({ venueInfo: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-gray-100 border-0" placeholder="e.g. The Grand Ballroom" /></div>
            <div><label className="text-sm text-gray-500 mb-1 block">Venue Address</label><input value={activeWedding.venueAddress || ''} onChange={e => updateWedding({ venueAddress: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-gray-100 border-0" placeholder="e.g. 123 Main St, City, State" /></div>
          </div>
        )}

        {tab === 'customize' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-3">Sections</h3>
                <div className="space-y-1">
                  {[['theme', '🎨 Theme & Colors'], ['content', '✏️ Invitation Text'], ['questions', '❓ RSVP Questions'], ['thankyou', '🎉 Thank You Page']].map(([k, l]) => (
                    <button key={k} onClick={() => setCustomizeSection(k)} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${customizeSection === k ? 'text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`} style={customizeSection === k ? { backgroundColor: wColor.primary } : {}}>{l}</button>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-3 bg-gray-50 border-b border-gray-100"><p className="text-xs font-medium text-gray-500 text-center">Live Preview</p></div>
                <div style={{ background: `linear-gradient(135deg, ${cust.bgStart || '#fff1f2'}, ${cust.bgEnd || '#fce7f3'})` }}>
                  <div className="p-4 text-center" style={{ backgroundImage: cust.bgPhoto ? `linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.85)), url(${cust.bgPhoto})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '200px' }}>
                    <p className="text-xs uppercase tracking-widest mb-2" style={{ color: cust.secondaryColor || '#be185d' }}>{cust.headerText || 'You Are Cordially Invited'}</p>
                    <h1 className="text-xl mb-2" style={{ color: cust.primaryColor || '#e11d48', ...(fontStyles.find(f => f.value === cust.fontStyle)?.style || {}) }}>{activeWedding.coupleName || 'Couple Name'}</h1>
                    <p className="text-xs text-gray-600">📅 {new Date(activeWedding.weddingDate).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-600">📍 {activeWedding.venueInfo || 'Venue'}</p>
                    <p className="text-xs text-gray-500 italic mt-2">{cust.footerText || "We can't wait to celebrate!"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              {customizeSection === 'theme' && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-5">
                  <h2 className="font-semibold text-gray-700">🎨 Theme & Colors</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm text-gray-500 mb-2 block">Primary Color</label><div className="flex gap-2"><input type="color" value={cust.primaryColor || '#e11d48'} onChange={e => updateCust('primaryColor', e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border" /><input type="text" value={cust.primaryColor || '#e11d48'} onChange={e => updateCust('primaryColor', e.target.value)} className="flex-1 px-3 py-2 rounded-lg bg-gray-100 text-sm font-mono" /></div></div>
                    <div><label className="text-sm text-gray-500 mb-2 block">Secondary Color</label><div className="flex gap-2"><input type="color" value={cust.secondaryColor || '#be185d'} onChange={e => updateCust('secondaryColor', e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border" /><input type="text" value={cust.secondaryColor || '#be185d'} onChange={e => updateCust('secondaryColor', e.target.value)} className="flex-1 px-3 py-2 rounded-lg bg-gray-100 text-sm font-mono" /></div></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm text-gray-500 mb-2 block">Background Start</label><div className="flex gap-2"><input type="color" value={cust.bgStart || '#fff1f2'} onChange={e => updateCust('bgStart', e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border" /><input type="text" value={cust.bgStart || '#fff1f2'} onChange={e => updateCust('bgStart', e.target.value)} className="flex-1 px-3 py-2 rounded-lg bg-gray-100 text-sm font-mono" /></div></div>
                    <div><label className="text-sm text-gray-500 mb-2 block">Background End</label><div className="flex gap-2"><input type="color" value={cust.bgEnd || '#fce7f3'} onChange={e => updateCust('bgEnd', e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border" /><input type="text" value={cust.bgEnd || '#fce7f3'} onChange={e => updateCust('bgEnd', e.target.value)} className="flex-1 px-3 py-2 rounded-lg bg-gray-100 text-sm font-mono" /></div></div>
                  </div>
                  <div><label className="text-sm text-gray-500 mb-2 block">Background Photo</label><div className="flex items-center gap-4"><label className="flex-1 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 cursor-pointer text-center bg-gray-50"><input type="file" accept="image/*" onChange={handleBgPhotoUpload} className="hidden" /><p className="text-gray-600 text-sm">{cust.bgPhoto ? '📷 Change photo' : '📷 Upload photo'}</p></label>{cust.bgPhoto && <div className="relative"><img src={cust.bgPhoto} alt="Preview" className="w-20 h-20 object-cover rounded-xl" /><button onClick={() => updateCust('bgPhoto', '')} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs">×</button></div>}</div></div>
                  <div><label className="text-sm text-gray-500 mb-2 block">Font Style</label><div className="grid grid-cols-2 gap-2">{fontStyles.map(f => <button key={f.value} onClick={() => updateCust('fontStyle', f.value)} className={`py-3 px-4 rounded-xl text-sm ${cust.fontStyle === f.value ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200'}`} style={f.style}>{f.name}</button>)}</div></div>
                </div>
              )}

              {customizeSection === 'content' && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-5">
                  <h2 className="font-semibold text-gray-700">✏️ Invitation Text</h2>
                  <div><label className="text-sm text-gray-500 mb-2 block">Header Text</label><input value={cust.headerText || ''} onChange={e => updateCust('headerText', e.target.value)} placeholder="You Are Cordially Invited To The Wedding Of" className="w-full px-4 py-3 rounded-xl bg-gray-100 border-0" /></div>
                  <div><label className="text-sm text-gray-500 mb-2 block">Footer Message</label><textarea value={cust.footerText || ''} onChange={e => updateCust('footerText', e.target.value)} placeholder="We can't wait to celebrate with you!" rows={2} className="w-full px-4 py-3 rounded-xl bg-gray-100 border-0 resize-none" /></div>
                  <hr className="border-gray-200" />
                  <h3 className="font-medium text-gray-600">RSVP Page</h3>
                  <div><label className="text-sm text-gray-500 mb-2 block">RSVP Title</label><input value={cust.rsvpTitle || ''} onChange={e => updateCust('rsvpTitle', e.target.value)} placeholder="Please RSVP" className="w-full px-4 py-3 rounded-xl bg-gray-100 border-0" /></div>
                  <div><label className="text-sm text-gray-500 mb-2 block">RSVP Subtitle</label><input value={cust.rsvpSubtitle || ''} onChange={e => updateCust('rsvpSubtitle', e.target.value)} placeholder="Find your name to respond" className="w-full px-4 py-3 rounded-xl bg-gray-100 border-0" /></div>
                </div>
              )}

              {customizeSection === 'questions' && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-gray-700">❓ RSVP Questions</h2>
                    <button onClick={() => setShowAddQuestion(true)} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium">+ Add Question</button>
                  </div>
                  <p className="text-sm text-gray-500">Customize what information you collect from guests</p>
                  <div className="space-y-2">
                    {activeWedding.questions?.map((q, i) => (
                      <div key={q.id}>
                        {editingQuestionId === q.id ? (
                          <div className="p-4 bg-amber-50 rounded-xl space-y-3 border-2 border-amber-200">
                            <input value={editingQuestion?.label || ''} onChange={e => setEditingQuestion(p => p ? { ...p, label: e.target.value } : p)} className="w-full px-4 py-2 rounded-xl bg-white border-0" />
                            <div className="grid grid-cols-2 gap-3">
                              <select value={editingQuestion?.type || 'text'} onChange={e => setEditingQuestion(p => p ? { ...p, type: e.target.value } : p)} className="px-4 py-2 rounded-xl bg-white border-0"><option value="text">Text</option><option value="textarea">Long Text</option><option value="select">Dropdown</option><option value="radio">Radio Buttons</option></select>
                              <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white"><input type="checkbox" checked={editingQuestion?.required || false} onChange={e => setEditingQuestion(p => p ? { ...p, required: e.target.checked } : p)} /><span className="text-sm">Required</span></label>
                            </div>
                            {(editingQuestion?.type === 'select' || editingQuestion?.type === 'radio') && <input value={editingQuestion?.options || ''} onChange={e => setEditingQuestion(p => p ? { ...p, options: e.target.value } : p)} placeholder="Options (comma separated)" className="w-full px-4 py-2 rounded-xl bg-white border-0" />}
                            <div className="flex gap-2"><button onClick={() => { setEditingQuestionId(null); setEditingQuestion(null); }} className="flex-1 py-2 rounded-xl bg-gray-200">Cancel</button><button onClick={saveEditQuestion} className="flex-1 py-2 rounded-xl bg-amber-500 text-white">Save</button></div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-400 text-sm w-6">{i + 1}.</span>
                            <div className="flex-1"><p className="font-medium text-gray-700">{q.label}</p><p className="text-xs text-gray-400">{q.type} {q.required && '• Required'}</p></div>
                            {q.editable !== false ? <div className="flex gap-1"><button onClick={() => startEditQuestion(q)} className="text-gray-400 hover:text-blue-600 p-1">✏️</button><button onClick={() => deleteQuestion(q.id)} className="text-gray-400 hover:text-red-600 p-1">🗑️</button></div> : <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded">Required</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {showAddQuestion && (
                    <div className="p-4 bg-blue-50 rounded-xl space-y-3 border-2 border-blue-200">
                      <input value={newQuestion.label} onChange={e => setNewQuestion(p => ({ ...p, label: e.target.value }))} placeholder="Question text" className="w-full px-4 py-2 rounded-xl bg-white border-0" />
                      <div className="grid grid-cols-2 gap-3">
                        <select value={newQuestion.type} onChange={e => setNewQuestion(p => ({ ...p, type: e.target.value }))} className="px-4 py-2 rounded-xl bg-white border-0"><option value="text">Text</option><option value="textarea">Long Text</option><option value="select">Dropdown</option><option value="radio">Radio Buttons</option></select>
                        <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white"><input type="checkbox" checked={newQuestion.required} onChange={e => setNewQuestion(p => ({ ...p, required: e.target.checked }))} /><span className="text-sm">Required</span></label>
                      </div>
                      {(newQuestion.type === 'select' || newQuestion.type === 'radio') && <input value={newQuestion.options} onChange={e => setNewQuestion(p => ({ ...p, options: e.target.value }))} placeholder="Options (comma separated)" className="w-full px-4 py-2 rounded-xl bg-white border-0" />}
                      <div className="flex gap-2"><button onClick={() => { setShowAddQuestion(false); setNewQuestion({ label: '', type: 'text', options: '', required: false }); }} className="flex-1 py-2 rounded-xl bg-gray-200">Cancel</button><button onClick={addQuestion} disabled={!newQuestion.label} className="flex-1 py-2 rounded-xl bg-blue-500 text-white disabled:opacity-50">Add Question</button></div>
                    </div>
                  )}
                </div>
              )}

              {customizeSection === 'thankyou' && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-5">
                  <h2 className="font-semibold text-gray-700">🎉 Thank You Page</h2>
                  <p className="text-sm text-gray-500">Customize the message guests see after submitting their RSVP</p>
                  <div><label className="text-sm text-gray-500 mb-2 block">Title</label><input value={cust.thankYouTitle || ''} onChange={e => updateCust('thankYouTitle', e.target.value)} placeholder="Thank You!" className="w-full px-4 py-3 rounded-xl bg-gray-100 border-0" /></div>
                  <div><label className="text-sm text-gray-500 mb-2 block">Message</label><textarea value={cust.thankYouMessage || ''} onChange={e => updateCust('thankYouMessage', e.target.value)} placeholder="Your RSVP has been submitted. We look forward to celebrating with you!" rows={3} className="w-full px-4 py-3 rounded-xl bg-gray-100 border-0 resize-none" /></div>
                  <div className="p-4 rounded-xl text-center" style={{ background: `linear-gradient(135deg, ${cust.bgStart || '#fff1f2'}, ${cust.bgEnd || '#fce7f3'})` }}>
                    <p className="text-xs text-gray-500 mb-2">Preview</p>
                    <div className="text-4xl mb-2">🎉</div>
                    <h3 className="text-xl font-bold text-gray-800">{cust.thankYouTitle || 'Thank You!'}</h3>
                    <p className="text-gray-600 text-sm mt-2">{cust.thankYouMessage || 'Your RSVP has been submitted.'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'guests' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex items-center gap-3"><h2 className="font-semibold text-gray-700">👥 Guest List</h2><span className="text-sm px-2 py-1 bg-gray-100 rounded-full">{activeWedding.guests.length} guests</span></div>
                <div className="flex gap-2">
                  <button onClick={() => setShowImportModal(true)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50">📥 Import CSV</button>
                  <button onClick={() => setShowAddGuest(true)} className="px-4 py-2 text-white rounded-xl" style={{ backgroundColor: wColor.primary }}>➕ Add Guest</button>
                </div>
              </div>
            </div>

            <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm">
              <option value="all">All Guests</option>
              <option value="Joyfully Accept">✅ Attending</option>
              <option value="Regretfully Decline">❌ Declined</option>
              <option value="Not Sure Yet">🤔 Maybe</option>
              <option value="Not Invited">⏳ Not Invited</option>
            </select>

            {filteredGuests.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                <div className="text-5xl mb-4">👥</div>
                <p className="text-gray-600 mb-4">{activeWedding.guests.length === 0 ? 'No guests yet. Add guests to get started!' : 'No guests match this filter'}</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200"><tr>{['Guest', 'Contact', 'Status', 'Response', ''].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredGuests.map(g => {
                      const status = getGuestStatus(g);
                      return (
                        <tr key={g.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3"><div className="font-medium text-gray-800">{g.name}</div></td>
                          <td className="px-4 py-3"><div className="text-xs text-gray-500">{g.email && <span>📧 {g.email}</span>}{g.email && g.phone && <br />}{g.phone && <span>📱 {g.phone}</span>}{!g.email && !g.phone && <span className="text-gray-400">No contact info</span>}</div></td>
                          <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>{getStatusEmoji(status)} {status}</span></td>
                          <td className="px-4 py-3">{g.attending ? <div className="text-sm"><div className={`font-medium ${g.attending === 'Joyfully Accept' ? 'text-emerald-600' : g.attending === 'Regretfully Decline' ? 'text-red-500' : 'text-amber-600'}`}>{g.attending === 'Joyfully Accept' ? '✅ Yes' : g.attending === 'Regretfully Decline' ? '❌ No' : '🤔 Maybe'}</div>{g.plusOne === 'Yes' && <div className="text-xs text-gray-500">+1{g.plusOneName ? `: ${g.plusOneName}` : ''}</div>}</div> : <span className="text-sm text-gray-400 italic">Awaiting</span>}</td>
                          <td className="px-4 py-3"><button onClick={() => deleteGuest(g.id)} className="text-xs px-2 py-1 bg-red-50 text-red-500 rounded hover:bg-red-100">🗑️</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'invitations' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h2 className="font-semibold text-gray-700 mb-4">📊 Invitation Stats</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl text-center"><div className="text-2xl font-bold text-gray-800">{activeWedding.guests.length}</div><div className="text-sm text-gray-500">Total Guests</div></div>
                <div className="p-4 bg-cyan-50 rounded-xl text-center"><div className="text-2xl font-bold text-cyan-600">{activeWedding.guests.filter(g => g.emailSent || g.smsSent).length}</div><div className="text-sm text-gray-500">Invited</div></div>
                <div className="p-4 bg-blue-50 rounded-xl text-center"><div className="text-2xl font-bold text-blue-600">{activeWedding.guests.filter(g => g.linkClicked).length}</div><div className="text-sm text-gray-500">Viewed</div></div>
                <div className="p-4 bg-emerald-50 rounded-xl text-center"><div className="text-2xl font-bold text-emerald-600">{stats.responded}</div><div className="text-sm text-gray-500">Responded</div></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-gray-700">📧 Email Template</h2>
                  <button onClick={() => openSendModal('email')} disabled={!activeWedding.guests.some(g => g.email)} className="px-4 py-2 text-white rounded-xl text-sm disabled:opacity-50" style={{ backgroundColor: wColor.primary }}>Send Emails</button>
                </div>
                <p className="text-xs text-gray-400 mb-3">Variables: {'{{name}}, {{couple}}, {{date}}, {{time}}, {{venue}}, {{rsvpLink}}'}</p>
                <input value={activeWedding.emailTemplate?.subject || ''} onChange={e => updateWedding({ emailTemplate: { ...activeWedding.emailTemplate, subject: e.target.value } })} placeholder="Subject" className="w-full px-4 py-2 rounded-xl bg-gray-100 border-0 mb-3" />
                <textarea value={activeWedding.emailTemplate?.body || ''} onChange={e => updateWedding({ emailTemplate: { ...activeWedding.emailTemplate, body: e.target.value } })} rows={8} className="w-full px-4 py-3 rounded-xl bg-gray-100 border-0 resize-none text-sm" />
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-gray-700">📱 SMS Template</h2>
                  <button onClick={() => openSendModal('sms')} disabled={!activeWedding.guests.some(g => g.phone)} className="px-4 py-2 text-white rounded-xl text-sm disabled:opacity-50" style={{ backgroundColor: wColor.primary }}>Send SMS</button>
                </div>
                <p className="text-xs text-gray-400 mb-3">Variables: {'{{name}}, {{couple}}, {{date}}, {{venue}}, {{rsvpLink}}'}</p>
                <textarea value={activeWedding.smsTemplate?.body || ''} onChange={e => updateWedding({ smsTemplate: { body: e.target.value } })} rows={4} className="w-full px-4 py-3 rounded-xl bg-gray-100 border-0 resize-none text-sm" />
                <p className="text-xs text-gray-400 mt-2">{(activeWedding.smsTemplate?.body || '').length}/160 characters</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {showAddGuest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Add Guest</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input value={newGuest.firstName} onChange={e => setNewGuest(p => ({ ...p, firstName: e.target.value }))} placeholder="First Name *" className="w-full px-4 py-3 rounded-xl bg-gray-100 border-0" />
                <input value={newGuest.lastName} onChange={e => setNewGuest(p => ({ ...p, lastName: e.target.value }))} placeholder="Last Name" className="w-full px-4 py-3 rounded-xl bg-gray-100 border-0" />
              </div>
              <input value={newGuest.email} onChange={e => setNewGuest(p => ({ ...p, email: e.target.value }))} placeholder="Email" className="w-full px-4 py-3 rounded-xl bg-gray-100 border-0" />
              <input value={newGuest.phone} onChange={e => setNewGuest(p => ({ ...p, phone: e.target.value }))} placeholder="Phone" className="w-full px-4 py-3 rounded-xl bg-gray-100 border-0" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddGuest(false)} className="flex-1 py-3 rounded-xl bg-gray-100 font-medium">Cancel</button>
              <button onClick={addGuest} disabled={!newGuest.firstName && !newGuest.lastName} className="flex-1 py-3 rounded-xl text-white font-medium disabled:opacity-50" style={{ backgroundColor: wColor.primary }}>Add Guest</button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">📥 Import Guests from CSV</h3>
              <button onClick={() => { setShowImportModal(false); setImportData([]); setImportError(''); }} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            
            {importData.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Upload a CSV with columns: First Name, Last Name, Email, Phone</p>
                <label className="block w-full p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 cursor-pointer text-center bg-gray-50">
                  <input type="file" accept=".csv" onChange={handleImportFile} className="hidden" />
                  <div className="text-4xl mb-2">📄</div>
                  <p className="text-gray-600 font-medium">Click to upload CSV</p>
                </label>
                {importError && <div className="bg-red-50 text-red-600 rounded-xl p-3 text-sm">⚠️ {importError}</div>}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 rounded-xl p-3 text-green-700">✅ Found {importData.length} rows</div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-gray-500 block mb-1">First Name *</label><select value={importMapping.firstName} onChange={e => setImportMapping(p => ({ ...p, firstName: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-gray-100 border-0"><option value="">Select column...</option>{importColumns.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div><label className="text-xs text-gray-500 block mb-1">Last Name</label><select value={importMapping.lastName} onChange={e => setImportMapping(p => ({ ...p, lastName: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-gray-100 border-0"><option value="">Select column...</option>{importColumns.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div><label className="text-xs text-gray-500 block mb-1">Email</label><select value={importMapping.email} onChange={e => setImportMapping(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-gray-100 border-0"><option value="">Select column...</option>{importColumns.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div><label className="text-xs text-gray-500 block mb-1">Phone</label><select value={importMapping.phone} onChange={e => setImportMapping(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-gray-100 border-0"><option value="">Select column...</option>{importColumns.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                </div>
                {importError && <div className="bg-red-50 text-red-600 rounded-xl p-3 text-sm">⚠️ {importError}</div>}
                <div className="flex gap-3">
                  <button onClick={() => { setImportData([]); setImportError(''); }} className="flex-1 py-3 rounded-xl bg-gray-100 font-medium">Back</button>
                  <button onClick={confirmImport} disabled={!importMapping.firstName && !importMapping.lastName} className="flex-1 py-3 rounded-xl text-white font-medium disabled:opacity-50" style={{ backgroundColor: wColor.primary }}>Import {importData.length} Guests</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showSendModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
            {sendSuccess ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <p className="text-xl font-semibold text-gray-800">{sendSuccess}</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-4">{sendType === 'email' ? '📧 Send Email Invitations' : '📱 Send SMS Invitations'}</h3>
                <p className="text-sm text-gray-500 mb-4">Select guests to send invitations:</p>
                <div className="flex gap-2 mb-3">
                  <button onClick={() => setSelectedGuests(activeWedding.guests.filter(g => sendType === 'email' ? g.email : g.phone).map(g => g.id))} className="text-xs px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200">Select All</button>
                  <button onClick={() => setSelectedGuests([])} className="text-xs px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200">Deselect All</button>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
                  {activeWedding.guests.filter(g => sendType === 'email' ? g.email : g.phone).map(g => (
                    <label key={g.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
                      <input type="checkbox" checked={selectedGuests.includes(g.id)} onChange={e => setSelectedGuests(prev => e.target.checked ? [...prev, g.id] : prev.filter(id => id !== g.id))} className="w-4 h-4 rounded" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{g.name}</p>
                        <p className="text-xs text-gray-500">{sendType === 'email' ? g.email : g.phone}</p>
                      </div>
                      {(sendType === 'email' ? g.emailSent : g.smsSent) && <span className="text-xs px-2 py-1 bg-cyan-100 text-cyan-700 rounded-full">Already Sent</span>}
                    </label>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowSendModal(false)} className="flex-1 py-3 rounded-xl bg-gray-100 font-medium">Cancel</button>
                  <button onClick={sendInvitations} disabled={selectedGuests.length === 0} className="flex-1 py-3 rounded-xl text-white font-medium disabled:opacity-50" style={{ backgroundColor: wColor.primary }}>Send to {selectedGuests.length} Guest{selectedGuests.length !== 1 ? 's' : ''}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
