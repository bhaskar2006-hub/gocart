'use client'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setProduct } from '@/lib/features/product/productSlice'
import { setCart } from '@/lib/features/cart/cartSlice'
import { setAddress } from '@/lib/features/address/addressSlice'
import { setUser } from '@/lib/features/user/userSlice'
import { assets } from '@/assets/assets'

export default function DataHydrator() {
  const dispatch = useDispatch()
  const cart = useSelector(state => state.cart.cartItems)
  const { isAuthenticated } = useSelector(state => state.user)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // 1. Fetch products from API
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products')
        if (res.ok) {
          const products = await res.json()
          const mappedProducts = products.map(product => ({
            ...product,
            images: product.images.map(img => assets[img] || img)
          }))
          dispatch(setProduct(mappedProducts))
        }
      } catch (err) {
        console.error('Failed to load products from database:', err)
      }
    }

    // 2. Fetch user session
    async function fetchUserSession() {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          if (data.authenticated) {
            dispatch(setUser(data.user))
            
            // Hydrate address
            if (data.user.Address) {
              dispatch(setAddress(data.user.Address))
            }

            // Hydrate cart
            if (data.user.cart) {
              const cartItems = data.user.cart
              const total = Object.values(cartItems).reduce((sum, qty) => sum + qty, 0)
              dispatch(setCart({ cartItems, total }))
            }
          }
        }
        setIsHydrated(true)
      } catch (err) {
        console.error('Failed to load user session:', err)
        setIsHydrated(true)
      }
    }

    fetchProducts()
    fetchUserSession()
  }, [dispatch])

  // Sync cart state back to database on updates
  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return

    async function syncCart() {
      try {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cartItems: cart })
        })
      } catch (err) {
        console.error('Failed to sync cart to database:', err)
      }
    }

    const delayDebounceFn = setTimeout(() => {
      syncCart()
    }, 1000)

    return () => clearTimeout(delayDebounceFn)
  }, [cart, isHydrated, isAuthenticated])

  return null
}
