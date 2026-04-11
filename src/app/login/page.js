'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import GoldDivider from '@/components/GoldDivider'
import Footer from '@/components/Footer'

export default function LoginPage() {
    
    const [email,    setEmail]    = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [errors,   setErrors]   = useState({})
    const [authError, setAuthError] = useState('')

    function validate() {
        const errors = {}
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (email.trim() === '') {
            errors.email = 'This field is required.'
        } else if (!emailPattern.test(email)) {
            errors.email = 'Please enter a valid email address.'
        }

        if (password === '') {
            errors.password = 'This field is required.'
        }

        return errors
    }

    function handleSubmit(evt) {
        evt.preventDefault()

        setAuthError('')

        const errors = validate()

        if (Object.keys(errors).length > 0) {
            setErrors(errors)
            return
        }

        setErrors({})
    }





}
