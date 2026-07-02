import { Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "@/lib/features/user/userSlice";
import { clearCart } from "@/lib/features/cart/cartSlice";
import { setAddress } from "@/lib/features/address/addressSlice";
import AuthModal from "./AuthModal";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { toast } from "react-hot-toast";

const Navbar = () => {

    const router = useRouter();
    const dispatch = useDispatch();

    const [search, setSearch] = useState('')
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)

    const cartCount = useSelector(state => state.cart.total)
    const { isAuthenticated, userInfo } = useSelector(state => state.user)

    const handleSearch = (e) => {
        e.preventDefault()
        router.push(`/shop?search=${search}`)
    }

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            dispatch(clearUser())
            dispatch(clearCart())
            dispatch(setAddress([]))
            setShowDropdown(false)
            router.push('/')
            toast.success('Logged out successfully!')
        } catch (e) {
            console.error('Logout error:', e)
        }
    }

    const userAvatar = userInfo ? (assets[userInfo.image] || userInfo.image) : null

    return (
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4  transition-all">

                    <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                        <span className="text-green-600">go</span>cart<span className="text-green-600 text-5xl leading-0">.</span>
                        <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                            plus
                        </p>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
                        <Link href="/">Home</Link>
                        <Link href="/shop">Shop</Link>
                        <Link href="/">About</Link>
                        <Link href="/">Contact</Link>

                        <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
                            <Search size={18} className="text-slate-600" />
                            <input className="w-full bg-transparent outline-none placeholder-slate-600" type="text" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                            <ShoppingCart size={18} />
                            Cart
                            <button className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">{cartCount}</button>
                        </Link>

                        {isAuthenticated && userInfo ? (
                            <div className="relative">
                                <button 
                                    onClick={() => setShowDropdown(!showDropdown)} 
                                    className="flex items-center gap-2 cursor-pointer focus:outline-none"
                                >
                                    <div className="size-9 rounded-full overflow-hidden border border-slate-200 flex items-center justify-center bg-slate-50">
                                        {userAvatar ? (
                                            <Image src={userAvatar} alt={userInfo.name} width={36} height={36} className="object-cover" />
                                        ) : (
                                            <span className="text-sm font-semibold">{userInfo.name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <span className="text-slate-700 font-medium max-lg:hidden">{userInfo.name}</span>
                                </button>
                                
                                {showDropdown && (
                                    <div className="absolute right-0 mt-3 w-48 bg-white border border-slate-100 rounded-xl shadow-xl py-2 z-50 text-sm">
                                        <div className="px-4 py-2 border-b border-slate-50">
                                            <p className="font-semibold text-slate-800 truncate">{userInfo.name}</p>
                                            <p className="text-xs text-slate-400 truncate">{userInfo.email}</p>
                                        </div>
                                        <Link href="/orders" onClick={() => setShowDropdown(false)} className="block px-4 py-2 hover:bg-slate-50 text-slate-700">My Orders</Link>
                                        
                                        {userInfo.email === 'greatstack@example.com' && (
                                            <Link href="/admin" onClick={() => setShowDropdown(false)} className="block px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium">Admin Panel</Link>
                                        )}
                                        
                                        <Link href="/store" onClick={() => setShowDropdown(false)} className="block px-4 py-2 hover:bg-slate-50 text-slate-700">Store Panel</Link>
                                        
                                        <button 
                                            onClick={handleLogout} 
                                            className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 border-t border-slate-50 font-medium transition"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button 
                                onClick={() => setShowAuthModal(true)} 
                                className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full cursor-pointer"
                            >
                                Login
                            </button>
                        )}

                    </div>

                    {/* Mobile User Button  */}
                    <div className="sm:hidden">
                        {isAuthenticated && userInfo ? (
                            <div className="relative">
                                <button 
                                    onClick={() => setShowDropdown(!showDropdown)} 
                                    className="flex items-center justify-center size-9 rounded-full overflow-hidden border border-slate-200 bg-slate-50"
                                >
                                    {userAvatar ? (
                                        <Image src={userAvatar} alt={userInfo.name} width={36} height={36} className="object-cover" />
                                    ) : (
                                        <span className="text-sm font-semibold">{userInfo.name.charAt(0)}</span>
                                    )}
                                </button>
                                
                                {showDropdown && (
                                    <div className="absolute right-0 mt-3 w-44 bg-white border border-slate-100 rounded-xl shadow-xl py-2 z-50 text-xs text-slate-600">
                                        <Link href="/orders" onClick={() => setShowDropdown(false)} className="block px-4 py-2 hover:bg-slate-50 text-slate-700">My Orders</Link>
                                        <Link href="/store" onClick={() => setShowDropdown(false)} className="block px-4 py-2 hover:bg-slate-50 text-slate-700">Store Panel</Link>
                                        {userInfo.email === 'greatstack@example.com' && (
                                            <Link href="/admin" onClick={() => setShowDropdown(false)} className="block px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium">Admin Panel</Link>
                                        )}
                                        <button 
                                            onClick={handleLogout} 
                                            className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 border-t border-slate-50 font-medium transition"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button 
                                onClick={() => setShowAuthModal(true)} 
                                className="px-7 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-sm transition text-white rounded-full cursor-pointer"
                            >
                                Login
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <hr className="border-gray-300" />
            {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
        </nav>
    )
}

export default Navbar