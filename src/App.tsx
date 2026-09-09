import { useState, useEffect } from 'react'

const N = '#0B1F3A'
const T = '#0D9488'
const G = '#16A34A'
const R = '#DC2626'
const A = '#D97706'

const QUESTIONS = [
  { q: 'Namaste Ravi. What brings you to the hospital today?', opts: ['Chest pain', 'Breathing difficulty', 'Fever', 'Other'] },
  { q: 'When did the chest pain start?', opts: ['Today', 'Yesterday', '2–3 days ago', 'Over a week'] },
  { q: 'Where exactly do you feel the pain?', opts: ['Central chest', 'Left chest', 'Right chest', 'All over'] },
  { q: 'How would you describe the pain?', opts: ['Crushing / pressure', 'Sharp / stabbing', 'Burning', 'Dull ache'] },
  { q: 'Does it spread to your arm, back, shoulder or jaw?', opts: ['Left arm', 'Right arm', 'Jaw / shoulder', 'No'] },
  { q: 'Do you have difficulty breathing?', opts: ['Yes, constantly', 'Sometimes', 'Only on exertion', 'No'] },
  { q: 'Do you feel dizzy, sweaty or nauseous?', opts: ['Yes, all three', 'Some of these', 'Just dizzy', 'No'] },
  { q: 'Do you have a history of heart problems?', opts: ['Yes', 'Not sure', 'No'] },
  { q: 'Are you taking any medications currently?', opts: ['Yes', 'No'] },
  { q: 'Do you have diabetes or high blood pressure?', opts: ['Both', 'Only BP', 'Only diabetes', 'Neither'] },
  { q: 'Any known allergies to medicines?', opts: ['Yes', 'No', 'Not sure'] },
  { q: 'Has anyone in your family had heart disease?', opts: ['Yes, father', 'Yes, other', 'No', 'Not sure'] },
]

const AYUSH = [
  { key: 'prakriti', label: 'Prakriti', icon: '🌿', q: 'Body constitution?', opts: ['Vata', 'Pitta', 'Kapha', 'Mixed'] },
  { key: 'vikriti', label: 'Vikriti', icon: '⚖️', q: 'Current imbalance?', opts: ['Vata excess', 'Pitta excess', 'Kapha excess', 'Mixed'] },
  { key: 'sara', label: 'Sara', icon: '✨', q: 'Essence quality?', opts: ['Excellent', 'Moderate', 'Low'] },
  { key: 'ahara', label: 'Ahara', icon: '🥗', q: 'Typical diet?', opts: ['Vegetarian', 'Non-veg', 'Vegan', 'Mixed'] },
  { key: 'nidra', label: 'Nidra', icon: '🌙', q: 'Sleep quality?', opts: ['Good', 'Moderate', 'Poor'] },
  { key: 'vyayama', label: 'Vyayama', icon: '💪', q: 'Exercise capacity?', opts: ['High', 'Moderate', 'Low'] },
]

type Screen =
  | 'welcome' | 'language' | 'consent' | 'identification' | 'profile'
  | 'ai-history' | 'touch-history' | 'red-flag' | 'doc-scan' | 'ocr-processing'
  | 'ocr-verify' | 'timeline' | 'ayush' | 'review' | 'ai-summary'
  | 'doctor-login' | 'patient-queue' | 'doctor-summary' | 'doc-viewer'
  | 'final-record' | 'abdm-fhir'

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome')
  const [lang, setLang] = useState('తెలుగు')
  const [agreed, setAgreed] = useState(false)
  const [qIdx, setQIdx] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [scanning, setScanning] = useState(false)
  const [scanStep, setScanStep] = useState(0)
  const [parts, setParts] = useState<string[]>([])
  const [ayushAns, setAyushAns] = useState<Record<string, string>>({})
  const [queueFilter, setQueueFilter] = useState('All')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [liveTranscript, setLiveTranscript] = useState('')

  const go = (s: Screen) => setScreen(s)

  const voiceLocale = (language: string) => ({
    'తెలుగు': 'te-IN',
    'हिन्दी': 'hi-IN',
    'தமிழ்': 'ta-IN',
    'ಕನ್ನಡ': 'kn-IN',
    'മലയാളം': 'ml-IN',
    'मराठी': 'mr-IN',
    'বাংলা': 'bn-IN',
    English: 'en-IN',
  } as Record<string, string>)[language] || 'en-IN'

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = voiceLocale(lang)
    utterance.rate = 0.92
    utterance.pitch = 1
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  const startListening = () => {
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!Recognition) {
      speakText('Voice input is not available in this browser. Please use the tap options below.')
      return
    }
    const recognition = new Recognition()
    recognition.lang = voiceLocale(lang)
    recognition.interimResults = true
    recognition.continuous = false
    setLiveTranscript('')
    setIsListening(true)
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join(' ')
      setLiveTranscript(transcript)
      if (event.results[event.results.length - 1].isFinal) {
        setIsListening(false)
        setAnswers(a => [...a, transcript])
        if (qIdx < QUESTIONS.length - 1) setQIdx(q => q + 1)
        else go('touch-history')
      }
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
    recognition.start()
  }

  useEffect(() => {
    if (screen === 'doc-scan') { setScanning(false); setScanStep(0) }
    if (screen === 'ai-history') { setQIdx(0); setAnswers([]) }
    if (screen === 'ayush') { setAyushAns({}) }
    if (screen === 'touch-history') setParts([])
  }, [screen])

  useEffect(() => {
    if (screen !== 'ocr-processing') return
    if (scanStep >= 5) { const t = setTimeout(() => go('ocr-verify'), 700); return () => clearTimeout(t) }
    const t = setTimeout(() => setScanStep(p => p + 1), 900)
    return () => clearTimeout(t)
  }, [screen, scanStep])

  useEffect(() => {
    if (screen !== 'ai-history') return
    const t = setTimeout(() => speakText(QUESTIONS[qIdx].q), 450)
    return () => clearTimeout(t)
  }, [screen, qIdx, lang])

  const answerQ = (ans: string) => {
    setAnswers(a => [...a, ans])
    if (qIdx < QUESTIONS.length - 1) setQIdx(q => q + 1)
    else go('touch-history')
  }

  // ── SHARED COMPONENTS ──────────────────────────────────────────────────────

  const PatientHeader = ({ step, total, dark = false, back }: { step?: number; total?: number; dark?: boolean; back?: Screen }) => (
    <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
      style={{ background: dark ? N : '#fff', borderBottom: dark ? 'none' : '1px solid #e8edf2' }}>
      <div className="flex items-center gap-3">
        {back && <button onClick={() => go(back)} style={{ color: dark ? '#94a3b8' : '#64748b', marginRight: 4 }}>←</button>}
        <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-sm"
          style={{ background: T, fontFamily: 'Outfit, sans-serif' }}>M</div>
        <div>
          <p className="font-bold text-sm leading-none" style={{ color: dark ? '#fff' : N, fontFamily: 'Outfit, sans-serif' }}>MediKiosk</p>
          <p className="text-xs leading-none mt-0.5" style={{ color: dark ? '#5eead4' : T }}>YOUR STORY. BETTER CARE.</p>
        </div>
      </div>
      {step && total && (
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs" style={{ color: dark ? '#94a3b8' : '#94a3b8' }}>Step {step} of {total}</span>
          <div className="w-24 h-1.5 rounded-full" style={{ background: dark ? '#1e3a5f' : '#e8edf2' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(step / total) * 100}%`, background: T }} />
          </div>
        </div>
      )}
    </div>
  )

  const DoctorHeader = ({ title, sub, back }: { title: string; sub?: string; back?: Screen }) => (
    <div className="flex items-center gap-4 px-6 py-4 flex-shrink-0" style={{ background: N }}>
      {back && <button onClick={() => go(back)} className="text-slate-400 text-lg">←</button>}
      <div className="flex-1">
        <p className="text-white font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>{title}</p>
        {sub && <p className="text-slate-400 text-sm">{sub}</p>}
      </div>
    </div>
  )

  // ── SCREEN 1: WELCOME ──────────────────────────────────────────────────────
  if (screen === 'welcome') return (
    <div className="h-full overflow-auto" style={{ background: '#f7fbfb' }}>
      <div className="min-h-full relative overflow-hidden">
        <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full blur-3xl opacity-30" style={{ background: '#2dd4bf' }} />
        <div className="absolute bottom-0 -left-28 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ background: '#60a5fa' }} />

        <header className="relative z-10 flex items-center justify-between px-7 py-5 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black shadow-lg" style={{ background: `linear-gradient(135deg, ${T}, #0f766e)` }}>M</div>
            <div>
              <div className="text-xl font-black tracking-tight" style={{ color: N, fontFamily: 'Outfit, sans-serif' }}>MediKiosk</div>
              <div className="text-[9px] font-black tracking-[0.2em]" style={{ color: T }}>YOUR STORY. BETTER CARE.</div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="px-3 py-2 rounded-full bg-white border border-slate-200">🇮🇳 Indian-language friendly</span>
            <span className="px-3 py-2 rounded-full bg-white border border-slate-200">🔒 Secure session</span>
          </div>
        </header>

        <main className="relative z-10 max-w-6xl mx-auto px-7 pt-4 pb-8 grid lg:grid-cols-[1.05fr_.95fr] gap-8 items-center">
          <section className="py-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5" style={{ background: '#e6fffb', color: '#0f766e', border: '1px solid #b8f3ea' }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: T }} /> AI-powered pre-consultation intake
            </div>
            <h1 className="text-5xl sm:text-6xl font-black leading-[0.98] tracking-tight" style={{ color: N, fontFamily: 'Outfit, sans-serif' }}>
              Your health story,<br /><span style={{ color: T }}>ready for your doctor.</span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-600 max-w-xl">
              Speak naturally, tap when you prefer, and scan old medical records. MediKiosk turns scattered information into a clear, doctor-ready clinical history.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <button onClick={() => go('language')} className="px-7 py-4 rounded-2xl text-lg font-black text-white shadow-xl transition-all hover:-translate-y-0.5 active:scale-95" style={{ background: `linear-gradient(135deg, ${T}, #0f766e)`, fontFamily: 'Outfit, sans-serif', boxShadow: `0 14px 30px ${T}35` }}>
                START YOUR HEALTH CHECK&nbsp; →
              </button>
              <button onClick={() => speakText('Welcome to MediKiosk. You can speak naturally, use the touchscreen, or scan your previous medical records.')} className="px-6 py-4 rounded-2xl text-base font-bold bg-white border-2 border-slate-200 transition-all hover:border-teal-300 active:scale-95" style={{ color: N }}>
                🔊 Hear how it works
              </button>
            </div>

            <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl">
              {[
                ['🎙️', 'Voice + Touch', 'Natural answers'],
                ['🌐', '8 Indian languages', 'Accessible by design'],
                ['📄', 'Smart documents', 'OCR + timeline'],
                ['🩺', 'Doctor-ready', 'AI draft + review'],
              ].map(([icon, title, sub]) => (
                <div key={title} className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="text-xl">{icon}</div>
                  <div className="text-xs font-black mt-2" style={{ color: N }}>{title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[470px] rounded-[2rem] p-5 shadow-2xl" style={{ background: `linear-gradient(145deg, ${N}, #12395f)`, boxShadow: '0 30px 80px rgba(11,31,58,.22)' }}>
              <div className="flex items-center justify-between px-1 pb-4">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#34d399' }} /><span className="text-xs font-bold text-slate-300">MediKiosk is ready</span></div>
                <span className="text-[10px] px-2.5 py-1 rounded-full text-teal-200" style={{ background: 'rgba(45,212,191,.12)' }}>LIVE DEMO</span>
              </div>
              <div className="rounded-[1.5rem] p-5" style={{ background: 'linear-gradient(160deg, #eafffb, #ffffff)' }}>
                <div className="flex items-center justify-between mb-5">
                  <div><p className="text-xs font-bold text-slate-400">PATIENT INTAKE</p><p className="text-xl font-black" style={{ color: N, fontFamily: 'Outfit, sans-serif' }}>Let's talk about your health</p></div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: '#d9f8f3' }}>🎙️</div>
                </div>
                <div className="rounded-2xl p-4 bg-white border border-teal-100 shadow-sm">
                  <div className="flex gap-3 items-start"><div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[10px] font-black" style={{ background: T }}>AI</div><div><p className="text-sm font-semibold" style={{ color: N }}>“What brings you to the hospital today?”</p><p className="text-[10px] text-slate-400 mt-1">Voice or touch — your choice</p></div></div>
                </div>
                <div className="flex items-center justify-center py-5">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center relative" style={{ background: `radial-gradient(circle, #5eead4 0%, ${T} 60%, #0f766e 100%)`, boxShadow: `0 0 0 12px rgba(13,148,136,.10), 0 0 0 24px rgba(13,148,136,.05)` }}><span className="text-3xl">🎙️</span></div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['ASK', 'SCAN', 'SUMMARIZE'].map((x, i) => <div key={x} className="text-center p-2.5 rounded-xl" style={{ background: '#f5faf9' }}><div className="text-[10px] font-black" style={{ color: T }}>0{i + 1}</div><div className="text-[10px] font-bold text-slate-500 mt-0.5">{x}</div></div>)}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {[['🌿', 'AYUSH ready'], ['⚠️', 'Red-flag routing'], ['🔗', 'FHIR / ABDM ready']].map(([i, t]) => <div key={t} className="text-center py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,.06)' }}><span className="text-sm">{i}</span><p className="text-[9px] text-slate-400 font-semibold mt-1">{t}</p></div>)}
              </div>
            </div>
          </section>
        </main>

        <div className="relative z-10 max-w-6xl mx-auto px-7 pb-7">
          <div className="rounded-2xl px-5 py-4 bg-white/90 border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div><p className="text-xs font-black uppercase tracking-wider" style={{ color: T }}>How MediKiosk works</p><p className="text-sm text-slate-500 mt-1">Patient story → structured history → clinician review</p></div>
            <div className="flex flex-wrap gap-2 text-xs font-bold" style={{ color: N }}>{['ASK', 'SCAN', 'UNDERSTAND', 'SUMMARIZE', 'CONNECT'].map((x, i) => <span key={x} className="px-2.5 py-1.5 rounded-lg" style={{ background: i === 4 ? '#e6fffb' : '#f1f5f9', color: i === 4 ? '#0f766e' : N }}>{x}</span>)}</div>
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-4">MediKiosk assists clinical documentation. Final clinical decisions remain with the healthcare professional.</p>
        </div>
      </div>
    </div>
  )

  // ── SCREEN 2: LANGUAGE ──────────────────────────────────────────────────────
  if (screen === 'language') return (
    <div className="h-full flex flex-col" style={{ background: '#f8fafc' }}>
      <PatientHeader step={1} total={15} />
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8 py-8 overflow-auto">
        <div className="text-center">
          <h2 className="text-3xl font-black" style={{ color: N, fontFamily: 'Outfit, sans-serif' }}>Choose your language</h2>
          <p className="text-slate-400 text-sm mt-1">अपनी भाषा चुनें · మీ భాషను ఎంచుకోండి</p>
        </div>
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {['English', 'हिन्दी', 'తెలుగు', 'தமிழ்', 'ಕನ್ನಡ', 'മലയാളം', 'मराठी', 'বাংলা'].map(l => (
            <button key={l} onClick={() => setLang(l)}
              className="py-4 px-4 rounded-2xl text-lg font-bold transition-all active:scale-95 shadow-sm"
              style={{
                background: lang === l ? T : '#fff',
                color: lang === l ? '#fff' : N,
                border: `2px solid ${lang === l ? T : '#e2e8f0'}`,
                boxShadow: lang === l ? `0 4px 18px ${T}44` : '0 1px 4px rgba(0,0,0,0.06)',
                fontFamily: 'Outfit, sans-serif',
              }}>
              {l}
            </button>
          ))}
        </div>
        <button onClick={() => go('consent')}
          className="w-full max-w-xs py-5 rounded-2xl text-xl font-bold text-white shadow-lg transition-all active:scale-95"
          style={{ background: N, fontFamily: 'Outfit, sans-serif' }}>
          CONTINUE →
        </button>
      </div>
    </div>
  )

  // ── SCREEN 3: CONSENT ──────────────────────────────────────────────────────
  if (screen === 'consent') return (
    <div className="h-full flex flex-col" style={{ background: '#f8fafc' }}>
      <PatientHeader step={2} total={15} />
      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-black" style={{ color: N, fontFamily: 'Outfit, sans-serif' }}>Before we begin</h2>
        </div>
        <div className="w-full max-w-sm rounded-3xl shadow-md overflow-hidden" style={{ background: '#fff' }}>
          <div className="p-6 space-y-4">
            <button className="flex items-center gap-3 py-3 px-5 rounded-2xl w-full"
              style={{ background: '#f0fdf4', border: `2px solid ${G}` }}>
              <span className="text-xl">🔊</span>
              <span className="font-bold" style={{ color: G, fontFamily: 'Outfit, sans-serif' }}>LISTEN TO INSTRUCTIONS</span>
            </button>
            <p className="text-slate-600 leading-relaxed text-base">
              MediKiosk will ask about your <strong style={{ color: N }}>symptoms, medical history, medicines</strong> and previous medical records.
            </p>
            <p className="text-slate-600 leading-relaxed text-base">
              We will create a <strong style={{ color: N }}>summary for your doctor</strong>. Your doctor reviews and verifies everything.
            </p>
            <label className="flex items-start gap-4 cursor-pointer p-4 rounded-2xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div onClick={() => setAgreed(a => !a)}
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                style={{ background: agreed ? T : '#fff', border: `2px solid ${agreed ? T : '#cbd5e1'}` }}>
                {agreed && <span className="text-white text-sm font-black">✓</span>}
              </div>
              <span className="text-slate-700 font-medium leading-relaxed">
                I understand and agree to share my health information with my doctor
              </span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm" style={{ color: '#64748b' }}>
          <span>🔒</span>
          <span>Your information is protected and only shared with your doctor</span>
        </div>

        <button onClick={() => agreed && go('identification')}
          className="w-full max-w-xs py-5 rounded-2xl text-xl font-bold text-white shadow-lg transition-all active:scale-95"
          style={{
            background: agreed ? T : '#94a3b8',
            cursor: agreed ? 'pointer' : 'not-allowed',
            fontFamily: 'Outfit, sans-serif',
          }}>
          AGREE & CONTINUE →
        </button>
      </div>
    </div>
  )

  // ── SCREEN 4: IDENTIFICATION ───────────────────────────────────────────────
  if (screen === 'identification') return (
    <div className="h-full flex flex-col" style={{ background: '#f8fafc' }}>
      <PatientHeader step={3} total={15} />
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-black" style={{ color: N, fontFamily: 'Outfit, sans-serif' }}>Let's identify you</h2>
          <p className="text-slate-400 mt-1">How would you like to continue?</p>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {[
            { icon: '📱', label: 'SCAN ABHA', desc: 'Scan QR code' },
            { icon: '⌨️', label: 'ENTER ABHA', desc: 'Type ABHA number' },
            { icon: '🏥', label: 'HOSPITAL ID', desc: 'Use patient card' },
            { icon: '➕', label: 'NEW PATIENT', desc: 'First visit here' },
          ].map(({ icon, label, desc }) => (
            <button key={label} onClick={() => go('profile')}
              className="flex flex-col items-center gap-2 py-6 px-3 rounded-2xl shadow-sm transition-all active:scale-95"
              style={{ background: '#fff', border: '2px solid #e2e8f0' }}>
              <span className="text-3xl">{icon}</span>
              <span className="font-bold text-sm" style={{ color: N, fontFamily: 'Outfit, sans-serif' }}>{label}</span>
              <span className="text-xs text-slate-400">{desc}</span>
            </button>
          ))}
        </div>
        <div className="w-full max-w-sm p-4 rounded-2xl flex items-center justify-between"
          style={{ background: '#f0fdf4', border: `1px solid ${G}30` }}>
          <div>
            <p className="text-xs text-slate-400">Patient ID</p>
            <p className="font-bold text-lg" style={{ color: N, fontFamily: 'Outfit, sans-serif' }}>MK-10245</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">ABHA Status</p>
            <p className="font-bold" style={{ color: G }}>✓ Connected</p>
          </div>
        </div>
      </div>
    </div>
  )

  // ── SCREEN 5: PROFILE ──────────────────────────────────────────────────────
  if (screen === 'profile') return (
    <div className="h-full flex flex-col" style={{ background: '#f8fafc' }}>
      <PatientHeader step={4} total={15} />
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-black" style={{ color: N, fontFamily: 'Outfit, sans-serif' }}>Welcome back</h2>
          <p className="text-slate-400 text-sm mt-1">Please confirm your details</p>
        </div>
        <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-xl"
          style={{ border: `2px solid ${T}30` }}>
          <div className="p-1" style={{ background: `linear-gradient(135deg, ${N}, ${T})` }}>
            <div className="rounded-[22px] p-6" style={{ background: '#fff' }}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-white text-xl"
                  style={{ background: `linear-gradient(135deg, ${T}, #0f766e)`, fontFamily: 'Outfit, sans-serif' }}>RK</div>
                <div>
                  <h3 className="text-2xl font-black" style={{ color: N, fontFamily: 'Outfit, sans-serif' }}>Ravi Kumar</h3>
                  <p className="text-slate-500 mt-0.5">52 years · Male</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-5">
                {[
                  { label: 'Language', value: lang },
                  { label: 'Patient ID', value: 'MK-10245' },
                  { label: 'ABHA', value: '✓ Linked' },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center p-3 rounded-xl" style={{ background: '#f8fafc' }}>
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="font-bold text-sm mt-0.5 truncate" style={{ color: N }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button onClick={() => go('ai-history')}
            className="w-full py-5 rounded-2xl text-xl font-bold text-white shadow-lg transition-all active:scale-95"
            style={{ background: T, fontFamily: 'Outfit, sans-serif' }}>
            ▶ START HEALTH CHECK
          </button>
          <button className="w-full py-3 rounded-2xl font-medium text-slate-500 transition-all active:scale-95"
            style={{ border: '2px solid #e2e8f0' }}>
            This is not me
          </button>
        </div>
      </div>
    </div>
  )

  // ── SCREEN 6: AI VOICE HISTORY ─────────────────────────────────────────────
  if (screen === 'ai-history') return (
    <div className="h-full flex flex-col" style={{ background: '#f8fafc' }}>
      <PatientHeader step={5} total={15} />
      {/* Progress bar */}
      <div className="px-5 py-3 flex-shrink-0" style={{ background: '#fff', borderBottom: '1px solid #e8edf2' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold" style={{ color: N, fontFamily: 'Outfit, sans-serif' }}>
            Question {qIdx + 1} of {QUESTIONS.length}
          </span>
          <button onClick={() => speakText(QUESTIONS[qIdx].q)} className="text-sm flex items-center gap-1 font-bold" style={{ color: T }}>🔊 Hear Question</button>
        </div>
        <div className="w-full h-2 rounded-full" style={{ background: '#e8edf2' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${((qIdx + 1) / QUESTIONS.length) * 100}%`, background: T }} />
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {answers.map((ans, i) => (
          <div key={i} className="space-y-2">
            <div className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                style={{ background: T, fontFamily: 'Outfit, sans-serif' }}>AI</div>
              <div className="rounded-2xl rounded-tl-none px-4 py-3 shadow-sm max-w-xs"
                style={{ background: '#fff', border: '1px solid #e8edf2' }}>
                <p className="text-slate-600 text-sm">{QUESTIONS[i].q}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="rounded-2xl rounded-tr-none px-4 py-3 text-white max-w-xs"
                style={{ background: N }}>
                <p className="text-sm">{ans}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Current question */}
        <div className="flex gap-3 items-start">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
            style={{ background: T, fontFamily: 'Outfit, sans-serif' }}>AI</div>
          <div className="rounded-2xl rounded-tl-none px-4 py-3 shadow-sm"
            style={{ background: '#fff', border: `2px solid ${T}30` }}>
            <p className="font-semibold text-sm" style={{ color: N }}>{QUESTIONS[qIdx].q}</p>
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 px-5 py-4 space-y-3" style={{ background: '#fff', borderTop: '1px solid #e8edf2' }}>
        <div className="flex items-center gap-4">
          <button onClick={startListening} className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg transition-all active:scale-90 ${isListening ? 'animate-pulse' : ''}`}
            style={{ background: isListening ? R : `linear-gradient(135deg, ${T}, #0f766e)`, boxShadow: `0 4px 20px ${T}50` }}>
            <span className="text-2xl">{isListening ? '⏹️' : '🎙️'}</span>
          </button>
          <div className="flex-1">
            <p className="font-bold" style={{ color: N, fontFamily: 'Outfit, sans-serif' }}>{isListening ? 'LISTENING…' : 'TAP TO SPEAK'}</p>
            <p className="text-xs text-slate-400 mt-0.5">{isListening ? 'Speak naturally. We are listening.' : 'or tap an answer below'}</p>
            {liveTranscript && <p className="text-xs mt-2 font-medium" style={{ color: T }}>“{liveTranscript}”</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {QUESTIONS[qIdx].opts.map(opt => (
            <button key={opt} onClick={() => answerQ(opt)}
              className="py-3 px-3 rounded-xl text-sm font-semibold transition-all active:scale-95 text-left"
              style={{ background: '#f1f5f9', color: N, border: '1px solid #e2e8f0' }}>
              👆 {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // ── SCREEN 7: TOUCH HISTORY ────────────────────────────────────────────────
  if (screen === 'touch-history') return (
    <div className="h-full flex flex-col" style={{ background: '#f8fafc' }}>
      <PatientHeader step={6} total={15} />
      <div className="flex-1 flex flex-col items-center gap-5 px-6 py-5 overflow-auto">
        <div className="text-center">
          <h2 className="text-2xl font-black" style={{ color: N, fontFamily: 'Outfit, sans-serif' }}>Where do you feel the pain?</h2>
          <p className="text-slate-400 text-sm mt-1">Tap all areas that apply on the body or buttons</p>
        </div>

        <div className="flex gap-6 items-start w-full max-w-sm">
          {/* Body SVG */}
          <div className="flex-1">
            <svg viewBox="0 0 100 230" className="w-full max-w-[110px] mx-auto">
              {/* Head */}
              <ellipse cx="50" cy="18" rx="14" ry="16"
                fill={parts.includes('Jaw') ? T : '#cbd5e1'} stroke="#94a3b8" strokeWidth="1"
                style={{ cursor: 'pointer' }} onClick={() => setParts(p => p.includes('Jaw') ? p.filter(x => x !== 'Jaw') : [...p, 'Jaw'])} />
              {/* Neck */}
              <rect x="44" y="33" width="12" height="10" fill={parts.includes('Jaw') ? T : '#cbd5e1'} />
              {/* Chest/torso */}
              <rect x="30" y="43" width="40" height="42" rx="5"
                fill={parts.includes('Chest') ? T : '#cbd5e1'} stroke="#94a3b8" strokeWidth="1"
                style={{ cursor: 'pointer' }} onClick={() => setParts(p => p.includes('Chest') ? p.filter(x => x !== 'Chest') : [...p, 'Chest'])} />
              {/* Left arm */}
              <rect x="8" y="44" width="20" height="52" rx="10"
                fill={parts.includes('Left arm') ? T : '#cbd5e1'} stroke="#94a3b8" strokeWidth="1"
                style={{ cursor: 'pointer' }} onClick={() => setParts(p => p.includes('Left arm') ? p.filter(x => x !== 'Left arm') : [...p, 'Left arm'])} />
              {/* Right arm */}
              <rect x="72" y="44" width="20" height="52" rx="10"
                fill={parts.includes('Right arm') ? T : '#cbd5e1'} stroke="#94a3b8" strokeWidth="1"
                style={{ cursor: 'pointer' }} onClick={() => setParts(p => p.includes('Right arm') ? p.filter(x => x !== 'Right arm') : [...p, 'Right arm'])} />
              {/* Shoulder / upper back */}
              <rect x="30" y="85" width="40" height="28" rx="4"
                fill={parts.includes('Back') ? T : '#c7d2dd'} stroke="#94a3b8" strokeWidth="1"
                style={{ cursor: 'pointer' }} onClick={() => setParts(p => p.includes('Back') ? p.filter(x => x !== 'Back') : [...p, 'Back'])} />
              {/* Legs */}
              <rect x="31" y="116" width="16" height="72" rx="8" fill="#dde4eb" stroke="#94a3b8" strokeWidth="1" />
              <rect x="53" y="116" width="16" height="72" rx="8" fill="#dde4eb" stroke="#94a3b8" strokeWidth="1" />
              {/* Labels */}
              <text x="50" y="22" textAnchor="middle" fontSize="5" fill="white" style={{ pointerEvents: 'none' }}>JAW</text>
              <text x="50" y="66" textAnchor="middle" fontSize="5" fill="white" style={{ pointerEvents: 'none' }}>CHEST</text>
              <text x="18" y="72" textAnchor="middle" fontSize="4" fill="white" style={{ pointerEvents: 'none' }}>L ARM</text>
              <text x="82" y="72" textAnchor="middle" fontSize="4" fill="white" style={{ pointerEvents: 'none' }}>R ARM</text>
              <text x="50" y="103" textAnchor="middle" fontSize="4" fill="white" style={{ pointerEvents: 'none' }}>BACK</text>
            </svg>
          </div>

          {/* Button list */}
          <div className="flex-1 flex flex-col gap-2">
            {['Chest', 'Left arm', 'Right arm', 'Back', 'Shoulder', 'Jaw'].map(part => (
              <button key={part} onClick={() => setParts(p => p.includes(part) ? p.filter(x => x !== part) : [...p, part])}
                className="py-3 px-4 rounded-xl text-sm font-semibold text-left transition-all active:scale-95"
                style={{
                  background: parts.includes(part) ? T : '#fff',
                  color: parts.includes(part) ? '#fff' : N,
                  border: `2px solid ${parts.includes(part) ? T : '#e2e8f0'}`,
                  fontFamily: 'Outfit, sans-serif',
                }}>
                {parts.includes(part) ? '✓ ' : ''}{part}
              </button>
            ))}
          </div>
        </div>

        <button className="flex items-center gap-2 py-2 px-5 rounded-xl"
          style={{ background: '#f0fdf4', border: `2px solid ${G}` }}>
          <span>🎙️</span>
          <span className="font-semibold text-sm" style={{ color: G }}>Answer by speaking</span>
        </button>

        <button onClick={() => go('red-flag')}
          className="w-full max-w-sm py-4 rounded-2xl font-bold text-white transition-all active:scale-95"
          style={{ background: N, fontFamily: 'Outfit, sans-serif' }}>
          CONTINUE →
        </button>
      </div>
    </div>
  )

  // ── SCREEN 8: RED FLAG ALERT ───────────────────────────────────────────────
  if (screen === 'red-flag') return (
    <div className="h-full flex flex-col" style={{ background: '#f8fafc' }}>
      <PatientHeader />
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8 py-8">
        <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl" style={{ border: `3px solid ${R}` }}>
          <div className="p-6 text-center" style={{ background: `linear-gradient(135deg, ${R}, #b91c1c)` }}>
            <div className="text-5xl mb-3 animate-pulse">⚠️</div>
            <h2 className="text-xl font-black text-white leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              PRIORITY CLINICAL ASSESSMENT RECOMMENDED
            </h2>
          </div>
          <div className="p-6 space-y-4" style={{ background: '#fff' }}>
            <p className="text-slate-600 text-center leading-relaxed">
              Some of your answers may require <strong>prompt medical attention</strong>. A healthcare professional has been notified.
            </p>
            <div className="p-4 rounded-2xl space-y-1.5" style={{ background: '#fef2f2', border: `1px solid ${R}20` }}>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: R }}>Symptoms Flagged</p>
              {['Chest pain (since yesterday)', 'Difficulty breathing', 'Dizziness and sweating'].map(s => (
                <p key={s} className="text-sm text-slate-600">• {s}</p>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <button className="w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95"
                style={{ background: R, fontFamily: 'Outfit, sans-serif' }}>
                🚨 REQUEST IMMEDIATE ASSISTANCE
              </button>
              <button onClick={() => go('doc-scan')}
                className="w-full py-4 rounded-2xl font-bold text-white transition-all active:scale-95"
                style={{ background: N, fontFamily: 'Outfit, sans-serif' }}>
                CONTINUE HISTORY →
              </button>
            </div>
            <p className="text-xs text-center text-slate-400">
              MediKiosk does not provide a diagnosis. All clinical decisions remain with the healthcare professional.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  // ── SCREEN 9: DOCUMENT SCAN ────────────────────────────────────────────────
  if (screen === 'doc-scan') return (
    <div className="h-full flex flex-col" style={{ background: '#f8fafc' }}>
      <PatientHeader step={7} total={15} />
      <div className="flex-1 flex flex-col items-center gap-4 px-6 py-5 overflow-auto">
        <div className="text-center">
          <h2 className="text-2xl font-black" style={{ color: N, fontFamily: 'Outfit, sans-serif' }}>Do you have previous medical records?</h2>
          <p className="text-slate-400 text-sm mt-1">Select type and scan your document</p>
        </div>

        <div className="grid grid-cols-4 gap-2 w-full max-w-sm">
          {[
            { icon: '📄', label: 'Prescription', color: '#dbeafe' },
            { icon: '🧪', label: 'Lab Report', color: '#dcfce7' },
            { icon: '🏥', label: 'Discharge', color: '#f0fdf4' },
            { icon: '🩻', label: 'Imaging', color: '#fef3c7' },
          ].map(({ icon, label, color }) => (
            <div key={label} className="p-3 rounded-2xl flex flex-col items-center gap-1.5 shadow-sm"
              style={{ background: color }}>
              <span className="text-2xl">{icon}</span>
              <span className="text-xs font-semibold text-center" style={{ color: N }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Scanner frame */}
        <div className="w-full max-w-xs">
          <div className="relative rounded-2xl overflow-hidden shadow-xl"
            style={{ background: '#0f172a', border: `3px solid ${scanning ? T : '#334155'}`, aspectRatio: '3/4', transition: 'border-color 0.3s' }}>
            {/* Document inside */}
            <div className="absolute inset-4 rounded-xl bg-white p-3 text-xs shadow-sm" style={{ opacity: 0.95 }}>
              <div className="border-b pb-2 mb-2 flex justify-between items-start">
                <div>
                  <p className="font-bold text-xs" style={{ color: N }}>Dr. P. Reddy, MD, DM</p>
                  <p className="text-slate-400">City General Hospital, Hyderabad</p>
                </div>
                <p className="text-slate-400 text-xs">12/03/2026</p>
              </div>
              <p className="font-semibold text-xs" style={{ color: N }}>Ravi Kumar, 52M</p>
              <p className="text-slate-500 text-xs">Diagnosis: Hypertension Stage II</p>
              <div className="mt-2 space-y-0.5">
                <p className="font-medium text-xs">Rx:</p>
                <p className="text-slate-600 text-xs">1. Amlodipine 5mg — 1-0-0</p>
                <p className="text-slate-600 text-xs">2. Aspirin 75mg — 0-0-1</p>
              </div>
              <div className="mt-2 pt-2 border-t">
                <p className="text-slate-500 text-xs">BP: 150/95 mmHg</p>
                <p className="text-slate-500 text-xs">HbA1c: 7.2%</p>
              </div>
            </div>
            {/* Scan animation line */}
            {scanning && (
              <div className="absolute left-4 right-4 h-0.5 rounded-full animate-bounce"
                style={{ background: T, top: '45%', boxShadow: `0 0 12px ${T}, 0 0 4px ${T}` }} />
            )}
            {/* Corner brackets */}
            {['tl', 'tr', 'bl', 'br'].map(c => (
              <div key={c} className="absolute w-6 h-6" style={{
                top: c.startsWith('t') ? 8 : 'auto', bottom: c.startsWith('b') ? 8 : 'auto',
                left: c.endsWith('l') ? 8 : 'auto', right: c.endsWith('r') ? 8 : 'auto',
                borderTop: c.startsWith('t') ? `2px solid ${T}` : 'none',
                borderBottom: c.startsWith('b') ? `2px solid ${T}` : 'none',
                borderLeft: c.endsWith('l') ? `2px solid ${T}` : 'none',
                borderRight: c.endsWith('r') ? `2px solid ${T}` : 'none',
              }} />
            ))}
            {!scanning && (
              <div className="absolute inset-0 flex items-end justify-center pb-3">
                <span className="text-xs text-slate-400">Align document within frame</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full max-w-xs">
          <button
            onClick={() => { setScanning(true); setTimeout(() => go('ocr-processing'), 2000) }}
            className="w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95"
            style={{ background: scanning ? '#0f766e' : T, fontFamily: 'Outfit, sans-serif' }}>
            {scanning ? '⏳ Scanning...' : '📸 SCAN DOCUMENT'}
          </button>
          <button onClick={() => go('timeline')} className="w-full py-3 rounded-xl font-medium text-slate-400 transition-all active:scale-95">
            Skip — No documents to scan
          </button>
        </div>
      </div>
    </div>
  )

  // ── SCREEN 10: OCR PROCESSING ──────────────────────────────────────────────
  if (screen === 'ocr-processing') {
    const steps = ['Document captured', 'Text detected', 'Medical information extracted', 'Confidence checked', 'Added to timeline']
    return (
      <div className="h-full flex flex-col items-center justify-center gap-8 px-8"
        style={{ background: `linear-gradient(160deg, ${N} 0%, #0f3460 100%)` }}>
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{ background: T, boxShadow: `0 0 40px ${T}60`, animation: 'pulse 2s infinite' }}>
          <span className="text-3xl">🔍</span>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Processing document…</h2>
          <p className="text-slate-400 mt-1">Extracting medical information using AI</p>
        </div>
        <div className="w-full max-w-xs space-y-3">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center gap-3 p-3 rounded-xl transition-all"
              style={{ background: i < scanStep ? `${T}20` : 'rgba(255,255,255,0.05)', border: `1px solid ${i < scanStep ? T + '40' : 'rgba(255,255,255,0.05)'}` }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                style={{ background: i < scanStep ? G : 'rgba(255,255,255,0.1)' }}>
                {i < scanStep
                  ? <span className="text-white text-sm font-bold">✓</span>
                  : i === scanStep
                    ? <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: T }} />
                    : <div className="w-2 h-2 rounded-full bg-slate-600" />}
              </div>
              <span className="text-sm font-medium" style={{ color: i < scanStep ? '#86efac' : '#64748b' }}>{step}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── SCREEN 11: OCR VERIFY ──────────────────────────────────────────────────
  if (screen === 'ocr-verify') return (
    <div className="h-full flex flex-col" style={{ background: '#f8fafc' }}>
      <PatientHeader step={8} total={15} />
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-5 space-y-5">
          <div>
            <h2 className="text-2xl font-black" style={{ color: N, fontFamily: 'Outfit, sans-serif' }}>Verify extracted information</h2>
            <p className="text-slate-400 text-sm mt-1">Check and confirm the information from your document</p>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
            <div className="px-4 py-3 flex items-center justify-between"
              style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <div className="flex items-center gap-2">
                <span>📄</span>
                <span className="font-bold text-sm" style={{ color: N }}>Prescription — 12 March 2026</span>
              </div>
              <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: '#dcfce7', color: G }}>92% confidence</span>
            </div>
            <div className="p-4 space-y-2">
              {[
                { label: 'Date', value: '12 March 2026', verify: false },
                { label: 'Diagnosis', value: 'Hypertension Stage II', verify: false },
                { label: 'Medicine 1', value: 'Amlodipine 5 mg once daily', verify: false },
                { label: 'Medicine 2', value: 'Aspirin 75 mg once daily', verify: false },
                { label: 'Blood Pressure', value: '150/95 mmHg', verify: true },
                { label: 'HbA1c', value: '7.2%', verify: true },
              ].map(({ label, value, verify }) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: verify ? '#fffbeb' : '#f8fafc', border: `1px solid ${verify ? '#fbbf24' : '#e2e8f0'}` }}>
                  <div>
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="font-semibold text-sm" style={{ color: N }}>{value}</p>
                  </div>
                  {verify && (
                    <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: '#fef3c7', color: A }}>⚠️ VERIFY</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center">
            Information marked ⚠️ VERIFY needs your confirmation before it is used.
          </p>

          <div className="flex gap-2">
            <button className="flex-1 py-3 rounded-xl font-semibold transition-all active:scale-95"
              style={{ background: '#f1f5f9', color: N }}>✏️ EDIT</button>
            <button onClick={() => go('timeline')}
              className="flex-1 py-3 rounded-xl font-bold text-white transition-all active:scale-95"
              style={{ background: G, fontFamily: 'Outfit, sans-serif' }}>✓ CONFIRM</button>
          </div>
        </div>
      </div>
    </div>
  )

  // ── SCREEN 12: TIMELINE ────────────────────────────────────────────────────
  if (screen === 'timeline') return (
    <div className="h-full flex flex-col" style={{ background: '#f8fafc' }}>
      <PatientHeader step={9} total={15} />
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-5 space-y-5">
          <div>
            <h2 className="text-2xl font-black" style={{ color: N, fontFamily: 'Outfit, sans-serif' }}>Medical Timeline</h2>
            <p className="text-slate-400 text-sm">Ravi Kumar · MK-10245</p>
          </div>

          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5" style={{ background: '#e2e8f0' }} />
            <div className="space-y-5">
              {[
                { date: '12 Mar 2026', icon: '📄', title: 'Prescription', sub: 'Hypertension · Amlodipine 5 mg', badge: 'New', bc: T },
                { date: '08 Nov 2025', icon: '🧪', title: 'Blood Test', sub: 'HbA1c: 7.2% · Blood glucose: 138 mg/dL', badge: null, bc: null },
                { date: '21 Jul 2025', icon: '🏥', title: 'Hospital Discharge', sub: 'Dept: Cardiology · Duration: 3 days', badge: null, bc: null },
                { date: '15 Feb 2025', icon: '📋', title: 'OPD Visit', sub: 'Chief complaint: Chest discomfort · ECG done', badge: null, bc: null },
              ].map(({ date, icon, title, sub, badge, bc }) => (
                <div key={date} className="flex gap-5 items-start relative">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10 shadow-sm"
                    style={{ background: '#fff', border: `2px solid ${T}` }}>
                    <span className="text-base">{icon}</span>
                  </div>
                  <div className="flex-1 rounded-2xl p-4 shadow-sm" style={{ background: '#fff' }}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-slate-400">{date}</p>
                        <p className="font-bold mt-0.5" style={{ color: N, fontFamily: 'Outfit, sans-serif' }}>{title}</p>
                        <p className="text-sm text-slate-500 mt-0.5">{sub}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {badge && <span className="text-xs px-2 py-0.5 rounded-full text-white font-bold" style={{ background: bc! }}>{badge}</span>}
                        <button className="text-xs px-2 py-1 rounded-lg font-medium" style={{ background: '#f1f5f9', color: T }}>View</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => go('ayush')}
            className="w-full py-4 rounded-2xl font-bold text-white transition-all active:scale-95"
            style={{ background: N, fontFamily: 'Outfit, sans-serif' }}>
            CONTINUE →
          </button>
        </div>
      </div>
    </div>
  )

  // ── SCREEN 13: AYUSH ──────────────────────────────────────────────────────
  if (screen === 'ayush') return (
    <div className="h-full flex flex-col" style={{ background: '#f8fafc' }}>
      <PatientHeader step={10} total={15} />
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-5 space-y-5">
          <div>
            <h2 className="text-2xl font-black" style={{ color: N, fontFamily: 'Outfit, sans-serif' }}>Assessment Type</h2>
            <p className="text-slate-400 text-sm">Select your preferred assessment</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl text-center shadow-sm cursor-pointer" style={{ background: '#f0fdf4', border: `2px solid ${G}` }}>
              <span className="text-2xl mb-2 block">🏥</span>
              <p className="font-bold text-sm" style={{ color: N, fontFamily: 'Outfit, sans-serif' }}>Modern Clinical History</p>
              <p className="text-xs text-slate-400 mt-1">Standard allopathic</p>
            </div>
            <div className="p-4 rounded-2xl text-center shadow-sm cursor-pointer" style={{ background: '#fefce8', border: `2px solid ${A}` }}>
              <span className="text-2xl mb-2 block">🌿</span>
              <p className="font-bold text-sm" style={{ color: N, fontFamily: 'Outfit, sans-serif' }}>AYUSH Assessment</p>
              <p className="text-xs text-slate-400 mt-1">Ayurveda / Yoga / Siddha</p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: '#fff' }}>
            <div className="px-4 py-3" style={{ background: '#fefce8', borderBottom: '1px solid #fde68a' }}>
              <h3 className="font-bold" style={{ color: '#92400e', fontFamily: 'Outfit, sans-serif' }}>🌿 AYUSH Assessment Parameters</h3>
              <p className="text-xs text-amber-600 mt-0.5">Tap options to record your answers</p>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {AYUSH.map(item => (
                <div key={item.key} className="p-3 rounded-xl"
                  style={{ background: ayushAns[item.key] ? '#f0fdf4' : '#f8fafc', border: `1px solid ${ayushAns[item.key] ? G : '#e2e8f0'}` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span>{item.icon}</span>
                    <span className="text-xs font-bold" style={{ color: N }}>{item.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {item.opts.slice(0, 2).map(opt => (
                      <button key={opt} onClick={() => setAyushAns(a => ({ ...a, [item.key]: opt }))}
                        className="text-xs py-1.5 px-1 rounded-lg font-medium transition-all"
                        style={{
                          background: ayushAns[item.key] === opt ? G : '#e8edf2',
                          color: ayushAns[item.key] === opt ? '#fff' : '#475569',
                        }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                  {ayushAns[item.key] && <p className="text-xs mt-1.5" style={{ color: G }}>✓ {ayushAns[item.key]}</p>}
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => go('review')}
            className="w-full py-4 rounded-2xl font-bold text-white transition-all active:scale-95"
            style={{ background: N, fontFamily: 'Outfit, sans-serif' }}>
            CONTINUE TO REVIEW →
          </button>
          <div className="h-2" />
        </div>
      </div>
    </div>
  )

  // ── SCREEN 14: REVIEW ─────────────────────────────────────────────────────
  if (screen === 'review') return (
    <div className="h-full flex flex-col" style={{ background: '#f8fafc' }}>
      <PatientHeader step={11} total={15} />
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-5 space-y-4">
          <div>
            <h2 className="text-2xl font-black" style={{ color: N, fontFamily: 'Outfit, sans-serif' }}>Review your health information</h2>
            <p className="text-slate-400 text-sm mt-1">Please review and edit if anything is incorrect</p>
          </div>

          {[
            { title: 'Chief Complaint', content: 'Chest pain since yesterday' },
            { title: 'History of Present Illness', content: 'Central chest pain, crushing in nature, radiating to left arm. Associated shortness of breath, dizziness and sweating.' },
            { title: 'Past Medical History', content: 'Hypertension Stage II' },
            { title: 'Past Surgical History', content: 'None reported' },
            { title: 'Medications', content: 'Amlodipine 5 mg once daily\nAspirin 75 mg once daily' },
            { title: 'Allergies', content: 'No known drug allergies reported' },
            { title: 'Family History', content: 'Father: Hypertension, Ischemic Heart Disease' },
            { title: 'Personal History', content: 'Non-smoker. Occasional alcohol use.' },
            { title: 'Previous Investigations', content: 'BP: 150/95 mmHg\nHbA1c: 7.2%' },
            { title: 'Documents', content: '3 documents scanned and digitized' },
          ].map(({ title, content }) => (
            <div key={title} className="rounded-2xl p-4 shadow-sm" style={{ background: '#fff' }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm" style={{ color: N, fontFamily: 'Outfit, sans-serif' }}>{title}</h3>
                <button className="text-xs px-3 py-1 rounded-lg font-medium" style={{ background: '#f1f5f9', color: T }}>EDIT</button>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line">{content}</p>
            </div>
          ))}

          <button onClick={() => go('ai-summary')}
            className="w-full py-5 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95"
            style={{ background: T, fontFamily: 'Outfit, sans-serif' }}>
            ✨ CREATE DOCTOR SUMMARY
          </button>
          <div className="h-4" />
        </div>
      </div>
    </div>
  )

  // ── SCREEN 15: AI SUMMARY ─────────────────────────────────────────────────
  if (screen === 'ai-summary') return (
    <div className="h-full flex flex-col" style={{ background: '#f8fafc' }}>
      <PatientHeader step={12} total={15} />
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: T }}>
              <span className="text-white text-lg">✨</span>
            </div>
            <div>
              <h2 className="text-xl font-black" style={{ color: N, fontFamily: 'Outfit, sans-serif' }}>AI-Generated Clinical Summary</h2>
              <span className="inline-block text-xs px-2 py-0.5 rounded-full font-bold mt-1"
                style={{ background: '#fef3c7', color: A }}>AI DRAFT — REQUIRES CLINICIAN REVIEW</span>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-lg" style={{ border: `2px solid ${T}30` }}>
            <div className="px-5 py-4 flex items-start justify-between" style={{ background: N }}>
              <div>
                <p className="text-white font-black text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>Ravi Kumar, 52 M</p>
                <p className="text-slate-400 text-sm">MK-10245 · {new Date().toLocaleDateString('en-IN')}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: R, color: '#fff' }}>🔴 PRIORITY</span>
            </div>
            <div className="p-5 space-y-4" style={{ background: '#fff' }}>
              {[
                { title: 'Chief Complaint', content: 'Chest pain since yesterday.' },
                { title: 'History of Present Illness', content: 'Onset: Yesterday\nLocation: Central chest\nCharacter: Crushing / pressure\nRadiation: Left arm\nAssociated: Shortness of breath, dizziness, diaphoresis' },
                { title: 'Past History', content: 'Hypertension Stage II' },
                { title: 'Medications', content: 'Amlodipine 5 mg once daily\nAspirin 75 mg once daily' },
                { title: 'Allergies', content: 'No known drug allergies reported' },
                { title: 'Investigations', content: 'BP: 150/95 mmHg\nHbA1c: 7.2%' },
                { title: 'Documents', content: '3 documents digitized and linked' },
              ].map(({ title, content }) => (
                <div key={title}>
                  <h3 className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: T }}>{title}</h3>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{content}</p>
                  <div className="mt-3 border-b border-slate-100" />
                </div>
              ))}
              <div className="p-3 rounded-xl" style={{ background: '#fef2f2', border: `1px solid ${R}30` }}>
                <p className="text-sm font-bold" style={{ color: R }}>⚠️ Priority clinical assessment recommended</p>
                <p className="text-xs text-slate-500 mt-0.5">Symptom pattern may require prompt cardiac evaluation.</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center">
            MediKiosk assists clinical documentation. Final clinical decisions remain with the healthcare professional.
          </p>

          <div className="flex gap-3">
            <button className="flex-1 py-3 rounded-xl font-semibold transition-all active:scale-95"
              style={{ background: '#f1f5f9', color: N }}>✏️ EDIT</button>
            <button onClick={() => go('doctor-login')}
              className="flex-1 py-3 rounded-xl font-bold text-white transition-all active:scale-95"
              style={{ background: G, fontFamily: 'Outfit, sans-serif' }}>📤 SEND TO DOCTOR</button>
          </div>
          <div className="h-4" />
        </div>
      </div>
    </div>
  )

  // ── SCREEN 16: DOCTOR LOGIN ────────────────────────────────────────────────
  if (screen === 'doctor-login') return (
    <div className="h-full flex flex-col" style={{ background: `linear-gradient(160deg, ${N} 0%, #0f3460 100%)` }}>
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl"
            style={{ background: T }}>
            <span className="text-3xl">🩺</span>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>MediKiosk</h1>
            <p className="font-bold mt-1" style={{ color: T }}>Clinical Console</p>
            <p className="text-slate-400 text-sm mt-0.5">For authorized healthcare professionals</p>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-400">Hospital ID</label>
            <input defaultValue="DOC-1042"
              className="w-full mt-1 px-4 py-3 rounded-xl text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-400">Password</label>
            <input type="password" defaultValue="password"
              className="w-full mt-1 px-4 py-3 rounded-xl text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} />
          </div>
          <button onClick={() => go('patient-queue')}
            className="w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95"
            style={{ background: T, fontFamily: 'Outfit, sans-serif' }}>
            LOGIN TO CONSOLE →
          </button>
        </div>

        <p className="text-xs text-slate-600 text-center">CGHS City General Hospital · Hyderabad</p>
      </div>
    </div>
  )

  // ── SCREEN 17: PATIENT QUEUE ───────────────────────────────────────────────
  if (screen === 'patient-queue') return (
    <div className="h-full flex flex-col" style={{ background: '#f8fafc' }}>
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ background: N }}>
        <div>
          <p className="text-slate-400 text-xs">Good Morning,</p>
          <p className="text-white font-black text-xl" style={{ fontFamily: 'Outfit, sans-serif' }}>Dr. Sharma</p>
          <p className="text-slate-400 text-xs">CGHS City General Hospital</p>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <p className="text-slate-400 text-xs text-right">Wednesday</p>
            <p className="text-white text-sm font-semibold text-right">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
          </div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm"
            style={{ background: T, fontFamily: 'Outfit, sans-serif' }}>DS</div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="px-6 py-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Total', value: '12', color: N },
              { label: 'Priority', value: '1', color: R },
              { label: 'Ready', value: '8', color: G },
              { label: 'Waiting', value: '3', color: A },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-3 rounded-2xl shadow-sm text-center" style={{ background: '#fff' }}>
                <p className="text-2xl font-black" style={{ color, fontFamily: 'Outfit, sans-serif' }}>{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {['All', 'Priority', 'Waiting', 'Ready'].map(f => (
              <button key={f} onClick={() => setQueueFilter(f)}
                className="flex-shrink-0 py-2 px-4 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: queueFilter === f ? N : '#fff',
                  color: queueFilter === f ? '#fff' : '#64748b',
                  border: '1px solid #e2e8f0',
                  fontFamily: 'Outfit, sans-serif',
                }}>
                {f}
              </button>
            ))}
          </div>

          {/* Patients */}
          <div className="space-y-3">
            {[
              { name: 'Ravi Kumar', age: '52 M', complaint: 'Chest Pain', priority: 'Priority', status: 'Summary Ready', dot: R, click: () => go('doctor-summary') },
              { name: 'Anita Rao', age: '34 F', complaint: 'Fever', priority: 'Routine', status: 'Waiting', dot: G, click: null },
              { name: 'Suresh Kumar', age: '67 M', complaint: 'Joint Pain', priority: 'Review', status: 'In Progress', dot: A, click: null },
              { name: 'Priya Menon', age: '28 F', complaint: 'Headache', priority: 'Routine', status: 'Summary Ready', dot: G, click: null },
              { name: 'Mohan Das', age: '45 M', complaint: 'Diabetes Follow-up', priority: 'Routine', status: 'Waiting', dot: G, click: null },
            ].map(({ name, age, complaint, priority, status, dot, click }) => (
              <div key={name} onClick={click || undefined}
                className="p-4 rounded-2xl shadow-sm transition-all"
                style={{
                  background: '#fff',
                  border: priority === 'Priority' ? `2px solid ${R}40` : '1px solid #e2e8f0',
                  cursor: click ? 'pointer' : 'default',
                }}>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0"
                    style={{ background: dot, fontFamily: 'Outfit, sans-serif' }}>
                    {name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold" style={{ color: N, fontFamily: 'Outfit, sans-serif' }}>{name}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: dot + '20', color: dot }}>
                        {priority === 'Priority' ? '🔴' : priority === 'Routine' ? '🟢' : '🟡'} {priority}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-0.5">{age} · {complaint}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs px-2 py-1 rounded-lg font-medium"
                      style={{ background: '#f1f5f9', color: '#475569' }}>{status}</span>
                    {click && <p className="text-xs mt-1" style={{ color: T }}>Open →</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // ── SCREEN 18: DOCTOR SUMMARY ─────────────────────────────────────────────
  if (screen === 'doctor-summary') return (
    <div className="h-full flex flex-col" style={{ background: '#f8fafc' }}>
      <div className="flex items-center gap-4 px-6 py-4 flex-shrink-0" style={{ background: N }}>
        <button onClick={() => go('patient-queue')} className="text-slate-400 text-lg font-bold">←</button>
        <div className="flex-1">
          <p className="text-white font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>Ravi Kumar · 52 M</p>
          <p className="text-slate-400 text-sm">MK-10245 · Chest Pain</p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: R, color: '#fff' }}>🔴 PRIORITY</span>
      </div>

      {/* Priority banner */}
      <div className="flex items-center gap-3 px-6 py-3 flex-shrink-0"
        style={{ background: '#fef2f2', borderBottom: `2px solid ${R}40` }}>
        <span className="text-lg">⚠️</span>
        <p className="text-sm font-black" style={{ color: R, fontFamily: 'Outfit, sans-serif' }}>
          PRIORITY CLINICAL ASSESSMENT RECOMMENDED
        </p>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="px-6 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs px-3 py-1 rounded-full font-bold" style={{ background: '#fef3c7', color: A }}>✨ AI DRAFT</span>
            <div className="flex gap-2">
              <button className="text-xs px-3 py-2 rounded-xl font-semibold" style={{ background: '#f1f5f9', color: '#475569' }}>✏️ EDIT</button>
              <button className="text-xs px-3 py-2 rounded-xl font-bold text-white" style={{ background: R }}>✗ REJECT</button>
              <button onClick={() => go('doc-viewer')}
                className="text-xs px-3 py-2 rounded-xl font-bold text-white" style={{ background: G }}>✓ ACCEPT</button>
            </div>
          </div>

          {[
            { title: 'Chief Complaint', content: 'Chest pain since yesterday.' },
            { title: 'History of Present Illness', content: 'Onset: Yesterday. Location: Central chest. Character: Crushing / pressure. Radiation: Left arm. Associated: Dyspnoea, diaphoresis, dizziness.' },
            { title: 'Past History', content: 'Hypertension Stage II' },
            { title: 'Medications', content: 'Amlodipine 5 mg OD\nAspirin 75 mg OD' },
            { title: 'Allergies', content: 'No known drug allergies' },
            { title: 'Family History', content: 'Father: Hypertension, Ischemic Heart Disease' },
            { title: 'Investigations', content: 'BP: 150/95 mmHg\nHbA1c: 7.2%\nECG: Pending' },
            { title: 'Review of Systems', content: 'Cardiovascular: Positive for chest pain, dyspnoea\nRespiratory: Mild dyspnoea\nNeurological: Dizziness\nAll others: Unremarkable' },
          ].map(({ title, content }) => (
            <div key={title} className="rounded-2xl p-4 shadow-sm" style={{ background: '#fff' }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: T }}>{title}</h3>
                <button className="text-xs text-slate-300 hover:text-slate-500 transition-colors">Edit</button>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{content}</p>
            </div>
          ))}

          <button onClick={() => go('doc-viewer')}
            className="w-full py-4 rounded-2xl font-bold text-white transition-all active:scale-95"
            style={{ background: T, fontFamily: 'Outfit, sans-serif' }}>
            VIEW SCANNED DOCUMENTS →
          </button>
          <div className="h-4" />
        </div>
      </div>
    </div>
  )

  // ── SCREEN 19: DOCUMENT VIEWER ────────────────────────────────────────────
  if (screen === 'doc-viewer') return (
    <div className="h-full flex flex-col" style={{ background: '#f8fafc' }}>
      <div className="flex items-center gap-4 px-6 py-4 flex-shrink-0" style={{ background: N }}>
        <button onClick={() => go('doctor-summary')} className="text-slate-400 text-lg font-bold">←</button>
        <p className="text-white font-bold flex-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Document Viewer</p>
        <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: `${G}30`, color: '#86efac' }}>OCR 92%</span>
      </div>

      {/* Tab bar */}
      <div className="flex px-4 pt-2 gap-2 flex-shrink-0" style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        {['📄 Prescription', '🧪 Lab Report', '🏥 Discharge'].map((t, i) => (
          <button key={t} className="py-2 px-3 rounded-t-lg text-xs font-semibold transition-all"
            style={{ background: i === 0 ? '#f8fafc' : 'transparent', color: i === 0 ? N : '#94a3b8', borderBottom: i === 0 ? `2px solid ${T}` : 'none' }}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Original */}
        <div className="w-1/2 border-r border-slate-200 overflow-auto flex flex-col">
          <div className="px-4 py-2 flex-shrink-0" style={{ background: '#f8fafc', borderBottom: '1px solid #e8edf2' }}>
            <p className="text-xs font-bold text-slate-400">ORIGINAL DOCUMENT</p>
          </div>
          <div className="p-3 flex-1">
            <div className="rounded-xl overflow-hidden shadow-sm" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
              <div className="p-4 text-xs space-y-2">
                <div className="pb-2 mb-2 border-b">
                  <p className="font-black text-xs" style={{ color: N }}>Dr. P. Reddy, MD, DM (Cardiology)</p>
                  <p className="text-slate-500">City General Hospital</p>
                  <p className="text-slate-500">Hyderabad — 500032</p>
                  <p className="text-slate-400 mt-1">Reg No: MCI-42387</p>
                </div>
                <div className="flex justify-between">
                  <p className="font-semibold">Ravi Kumar, 52M</p>
                  <p className="text-slate-400">12/03/2026</p>
                </div>
                <p className="text-slate-600">Diagnosis: Hypertension Stage II</p>
                <div className="mt-1 space-y-0.5">
                  <p className="font-medium">Rx:</p>
                  <p className="text-slate-600">1. Amlodipine 5mg — 1-0-0</p>
                  <p className="text-slate-600">2. Aspirin 75mg — 0-0-1</p>
                  <p className="text-slate-600">3. Atorvastatin 10mg — 0-0-1</p>
                </div>
                <div className="pt-2 mt-2 border-t space-y-0.5">
                  <p className="text-slate-600">BP: 150/95 mmHg</p>
                  <p className="text-slate-600">HbA1c: 7.2%</p>
                </div>
                <p className="text-slate-400 pt-1">Next review: 4 weeks</p>
              </div>
            </div>
          </div>
        </div>

        {/* Extracted */}
        <div className="w-1/2 overflow-auto flex flex-col">
          <div className="px-4 py-2 flex-shrink-0" style={{ background: '#f0fdf4', borderBottom: '1px solid #dcfce7' }}>
            <p className="text-xs font-bold" style={{ color: G }}>AI EXTRACTED DATA</p>
          </div>
          <div className="p-3 space-y-2 flex-1">
            {[
              { f: 'Doctor', v: 'Dr. P. Reddy' },
              { f: 'Date', v: '12 March 2026' },
              { f: 'Patient', v: 'Ravi Kumar, 52M' },
              { f: 'Diagnosis', v: 'Hypertension Stage II' },
              { f: 'Medicine 1', v: 'Amlodipine 5mg' },
              { f: 'Medicine 2', v: 'Aspirin 75mg' },
              { f: 'Medicine 3', v: 'Atorvastatin 10mg' },
              { f: 'BP', v: '150/95 mmHg' },
              { f: 'HbA1c', v: '7.2%' },
            ].map(({ f, v }) => (
              <div key={f} className="p-2 rounded-xl" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
                <p className="text-xs text-slate-400">{f}</p>
                <p className="text-xs font-bold" style={{ color: N }}>{v}</p>
              </div>
            ))}
            <div className="flex gap-1.5 pt-1">
              <button className="flex-1 py-2 rounded-xl text-xs font-bold" style={{ background: '#fef2f2', color: R }}>✗ REJECT</button>
              <button className="flex-1 py-2 rounded-xl text-xs font-semibold" style={{ background: '#f1f5f9', color: N }}>✏️ EDIT</button>
              <button onClick={() => go('final-record')} className="flex-1 py-2 rounded-xl text-xs font-bold text-white" style={{ background: G }}>✓ ACCEPT</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ── SCREEN 20: FINAL RECORD ────────────────────────────────────────────────
  if (screen === 'final-record') return (
    <div className="h-full flex flex-col" style={{ background: '#f8fafc' }}>
      <DoctorHeader title="Verified Clinical Record" back="doc-viewer" />
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-5 space-y-5">
          <div className="p-4 rounded-2xl flex items-center gap-4 shadow-sm"
            style={{ background: '#f0fdf4', border: `2px solid ${G}` }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: G }}>
              <span className="text-white text-2xl font-black">✓</span>
            </div>
            <div>
              <p className="font-black text-lg" style={{ color: G, fontFamily: 'Outfit, sans-serif' }}>CLINICIAN VERIFIED</p>
              <p className="text-sm text-slate-500">Dr. Sharma · CGHS City General Hospital</p>
              <p className="text-xs text-slate-400">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-lg">
            <div className="px-5 py-4" style={{ background: N }}>
              <p className="text-white font-black text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>Ravi Kumar, 52 M</p>
              <p className="text-slate-400 text-sm">MK-10245 · ABHA Linked</p>
            </div>
            <div className="p-5 space-y-4" style={{ background: '#fff' }}>
              {[
                { title: 'Chief Complaint', content: 'Chest pain since yesterday.' },
                { title: 'HPI', content: 'Central crushing chest pain, radiation to left arm, associated dyspnoea, diaphoresis, and dizziness. Onset yesterday.' },
                { title: 'Past History', content: 'Hypertension Stage II' },
                { title: 'Medications', content: 'Amlodipine 5mg OD · Aspirin 75mg OD · Atorvastatin 10mg OD' },
                { title: 'Allergies', content: 'NKDA' },
                { title: 'Investigations', content: 'BP: 150/95 mmHg · HbA1c: 7.2%' },
                { title: 'Documents', content: '3 documents — verified and linked' },
              ].map(({ title, content }) => (
                <div key={title}>
                  <p className="text-xs font-black uppercase tracking-wider mb-0.5" style={{ color: T }}>{title}</p>
                  <p className="text-sm text-slate-700">{content}</p>
                  <div className="mt-3 border-b border-slate-100" />
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => go('abdm-fhir')}
            className="w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95"
            style={{ background: T, fontFamily: 'Outfit, sans-serif' }}>
            💾 SAVE TO PATIENT RECORD & SYNC →
          </button>
        </div>
      </div>
    </div>
  )

  // ── SCREEN 21: ABDM / FHIR ────────────────────────────────────────────────
  if (screen === 'abdm-fhir') return (
    <div className="h-full flex flex-col" style={{ background: '#f8fafc' }}>
      <PatientHeader dark={false} />
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8 py-8 overflow-auto">
        <div className="text-center">
          <h2 className="text-2xl font-black" style={{ color: N, fontFamily: 'Outfit, sans-serif' }}>Integration Status</h2>
          <span className="inline-block text-xs px-3 py-1 rounded-full font-bold mt-2"
            style={{ background: '#fef3c7', color: A }}>PROTOTYPE INTEGRATION</span>
        </div>

        {/* Flow diagram */}
        <div className="w-full max-w-xs space-y-1">
          {[
            { label: 'MediKiosk', icon: '💊', sub: 'Clinical intake & AI summary', arrow: true },
            { label: 'Hospital HIS / EMR', icon: '🏥', sub: 'Electronic Medical Records', arrow: true },
            { label: 'ABDM / ABHA', icon: '🇮🇳', sub: 'Ayushman Bharat Digital Mission', arrow: false },
          ].map(({ label, icon, sub, arrow }) => (
            <div key={label}>
              <div className="p-4 rounded-2xl shadow-sm flex items-center gap-3"
                style={{ background: '#fff', border: `2px solid ${T}20` }}>
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="font-bold text-sm" style={{ color: N, fontFamily: 'Outfit, sans-serif' }}>{label}</p>
                  <p className="text-xs text-slate-400">{sub}</p>
                </div>
              </div>
              {arrow && (
                <div className="flex justify-center py-1">
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-4" style={{ background: T }} />
                    <div style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `6px solid ${T}` }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Checklist */}
        <div className="w-full max-w-xs space-y-2">
          {['Consent recorded', 'Structured clinical data generated', 'Documents digitized and linked', 'FHIR-ready data package created', 'Transmitted to Hospital HIS'].map(item => (
            <div key={item} className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: '#f0fdf4', border: `1px solid ${G}20` }}>
              <span className="font-black text-sm" style={{ color: G }}>✓</span>
              <span className="text-sm font-medium" style={{ color: N }}>{item}</span>
            </div>
          ))}
        </div>

        <div className="w-full max-w-xs p-4 rounded-2xl text-center"
          style={{ background: '#fffbeb', border: `1px solid ${A}30` }}>
          <p className="font-bold text-sm" style={{ color: A }}>⚠️ Prototype Note</p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            This prototype does not connect to live government APIs. Integration shown is for demonstration purposes only.
          </p>
        </div>

        <button onClick={() => go('welcome')}
          className="w-full max-w-xs py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95"
          style={{ background: N, fontFamily: 'Outfit, sans-serif' }}>
          🏠 RETURN TO KIOSK HOME
        </button>
      </div>
    </div>
  )

  return null
}
