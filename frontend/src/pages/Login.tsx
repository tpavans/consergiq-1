import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ShieldAlert, Smartphone, Mail, Chrome, CheckCircle2, ArrowRight } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { login, signup, mobileLogin, googleLogin } = useAuth()
  
  const [authMethod, setAuthMethod] = useState<'email' | 'mobile' | 'google'>('email')
  const [isRegister, setIsRegister] = useState(false)
  
  // Email states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('GUEST')
  
  // Mobile OTP states
  const [mobileNum, setMobileNum] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')

  // Google state
  const [googleEmail, setGoogleEmail] = useState('')
  const [googleName, setGoogleName] = useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (isRegister) {
        await signup({ email, password, fullName, phone, role })
        setSuccess('Account created successfully! Please log in.')
        setIsRegister(false)
        setPassword('')
      } else {
        await login(email, password)
        navigate('/')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.')
    }
  }

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (!mobileNum || mobileNum.length < 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }
    setError('')
    setOtpSent(true)
    setOtpCode('123456') // Pre-fill sample OTP for seamless testing
    setSuccess('Verification OTP sent to ' + mobileNum)
  }

  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      await mobileLogin(mobileNum, otpCode)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mobile verification failed. Please try again.')
    }
  }

  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const targetEmail = googleEmail || 'traveler.google@example.com'
    const targetName = googleName || 'Google Guest'

    try {
      await googleLogin(targetEmail, targetName)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Google authentication failed.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white font-sans">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Header Logo */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-600/30">
            <span className="font-extrabold text-2xl tracking-tighter leading-none text-white">C</span>
          </div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white">ConciergeIQ</h2>
          <p className="text-xs text-gray-400">Your AI-Powered Travel Orchestrator</p>
        </div>

        {/* Method Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-zinc-800/80 p-1.5 rounded-2xl mb-6 border border-zinc-700/50">
          <button
            type="button"
            onClick={() => { setAuthMethod('email'); setError(''); setSuccess(''); }}
            className={`py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              authMethod === 'email' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Mail size={14} />
            <span>Email</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthMethod('mobile'); setError(''); setSuccess(''); }}
            className={`py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              authMethod === 'mobile' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Smartphone size={14} />
            <span>Mobile</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthMethod('google'); setError(''); setSuccess(''); }}
            className={`py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              authMethod === 'google' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Chrome size={14} />
            <span>Google</span>
          </button>
        </div>

        {/* Banners */}
        {error && (
          <div className="mb-4 bg-red-950/60 border border-red-800 text-red-300 p-3 rounded-xl text-xs flex items-center gap-2">
            <ShieldAlert size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* 1. EMAIL AUTH METHOD */}
        {authMethod === 'email' && (
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
            {isRegister && (
              <>
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Account Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-white"
                  >
                    <option value="GUEST">GUEST (Traveler)</option>
                    <option value="STAFF">HOTEL STAFF</option>
                    <option value="ADMIN">ADMINISTRATOR</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Email Address</label>
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-white"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-gray-400">Password</label>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all mt-2"
            >
              {isRegister ? 'Create Account' : 'Sign In with Email'}
            </button>
          </form>
        )}

        {/* 2. MOBILE NUMBER AUTH METHOD */}
        {authMethod === 'mobile' && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Mobile Number</label>
                  <div className="flex items-center gap-2">
                    <span className="bg-zinc-800 border border-zinc-700 px-3 py-3 rounded-xl text-sm font-bold text-gray-300">+91</span>
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={mobileNum}
                      onChange={(e) => setMobileNum(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-white font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <span>Send Login OTP</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleMobileSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1.5 block">
                    Enter 6-Digit OTP sent to +91 {mobileNum}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-center text-lg tracking-widest font-mono focus:outline-none focus:border-indigo-500 transition-colors text-white"
                  />
                  <p className="text-[11px] text-indigo-400 mt-1 text-right">Demo OTP auto-filled</p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all mt-1"
                >
                  Verify & Continue
                </button>

                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-xs text-gray-400 hover:text-white text-center underline"
                >
                  Change Mobile Number
                </button>
              </form>
            )}
          </div>
        )}

        {/* 3. GOOGLE ACCOUNT AUTH METHOD */}
        {authMethod === 'google' && (
          <form onSubmit={handleGoogleSubmit} className="flex flex-col gap-4">
            <div className="bg-zinc-800/60 border border-zinc-700/60 p-4 rounded-2xl text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white text-zinc-900 flex items-center justify-center shadow-lg">
                <Chrome size={28} className="text-indigo-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Google One-Tap Login</h4>
                <p className="text-xs text-gray-400 mt-0.5">Instant sign in with your Google Account</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Google Email</label>
              <input
                type="email"
                placeholder="traveler@gmail.com"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Display Name (Optional)</label>
              <input
                type="text"
                placeholder="Anusri Kommana"
                value={googleName}
                onChange={(e) => setGoogleName(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-white hover:bg-gray-100 text-zinc-900 text-sm font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
            >
              <Chrome size={18} className="text-indigo-600" />
              <span>Continue with Google</span>
            </button>
          </form>
        )}

        {/* Footer Toggle for Email Registration */}
        {authMethod === 'email' && (
          <div className="text-center mt-6 text-xs text-gray-400">
            <span>
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <button
              onClick={() => {
                setIsRegister(!isRegister)
                setError('')
                setSuccess('')
              }}
              className="text-indigo-400 font-semibold hover:underline"
            >
              {isRegister ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
