'use client'
import { useState } from 'react'
import { XIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { setUser } from '@/lib/features/user/userSlice'
import { setCart } from '@/lib/features/cart/cartSlice'
import { setAddress } from '@/lib/features/address/addressSlice'

export default function AuthModal({ onClose }) {
  const dispatch = useDispatch()
  const [mode, setMode] = useState('login') // 'login' or 'register'
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
    const payload = mode === 'login' 
      ? { email: formData.email, password: formData.password }
      : formData

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(mode === 'login' ? 'Logged in successfully!' : 'Account registered successfully!')
        
        // Save user to Redux store
        dispatch(setUser(data.user))
        
        // Sync cart & addresses
        if (data.user.cart) {
          const cartItems = data.user.cart
          const total = Object.values(cartItems).reduce((sum, qty) => sum + qty, 0)
          dispatch(setCart({ cartItems, total }))
        }
        if (data.user.Address) {
          dispatch(setAddress(data.user.Address))
        }

        onClose()
      } else {
        toast.error(data.error || 'Authentication failed')
      }
    } catch (error) {
      console.error('Auth error:', error)
      toast.error('An error occurred during authentication')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs">
      <div className="relative w-full max-w-md p-8 mx-4 bg-white rounded-2xl border border-slate-100 shadow-2xl transition-all duration-300">
        
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <XIcon size={20} />
        </button>

        <h2 className="text-3xl font-semibold text-slate-800 text-center mb-1">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-slate-400 text-sm text-center mb-8">
          {mode === 'login' ? 'Sign in to access your GoCart store' : 'Sign up to start shopping on GoCart'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'register' && (
            <div>
              <label className="block text-slate-600 text-xs font-semibold uppercase mb-2">Full Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange}
                placeholder="John Doe" 
                className="w-full px-4 py-3 outline-none border border-slate-200 rounded-lg text-slate-800 text-sm focus:border-slate-400 transition-colors"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-slate-600 text-xs font-semibold uppercase mb-2">Email Address</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange}
              placeholder="you@example.com" 
              className="w-full px-4 py-3 outline-none border border-slate-200 rounded-lg text-slate-800 text-sm focus:border-slate-400 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-slate-600 text-xs font-semibold uppercase mb-2">Password</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange}
              placeholder="••••••••" 
              className="w-full px-4 py-3 outline-none border border-slate-200 rounded-lg text-slate-800 text-sm focus:border-slate-400 transition-colors"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-800 hover:bg-slate-900 transition text-white py-3 font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 active:scale-[0.98] transform"
          >
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-6 text-sm text-slate-500">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button 
                onClick={() => setMode('register')} 
                className="text-indigo-600 hover:text-indigo-700 font-semibold transition"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button 
                onClick={() => setMode('login')} 
                className="text-indigo-600 hover:text-indigo-700 font-semibold transition"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
