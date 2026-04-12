'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import GoldDivider from '@/components/layout/GoldDivider'
import Footer from '@/components/layout/Footer'

const AUS_PHONE = /^(\+?61|0)[2-9]\d{8}$/

export default function SignUpPage() {
    const [form, setForm] = useState({ firstName:'', lastName:'', email:'', phone:'', password:'', confirmPassword:'' })


    function update(field, value) {
        setForm((previousForm) => ({...previousForm,
        [field]: value,
    }))

    if (errors[field]) {
        setErrors((previousErrors) => ({
        ...previousErrors,
        [field]: '',
        }))
    }
    }

    function validate() {
        const errors = {}
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const cleanedPhone = form.phone.replace(/\s/g, '')

        if (form.firstName.trim() === '') {
            errors.firstName = 'This field is required.'
        }

        if (form.lastName.trim() === '') {
            errors.lastName = 'This field is required.'
        }

        if (form.email.trim() === '') {
            errors.email = 'This field is required.'
        } else if (!emailPattern.test(form.email)) {
            errors.email = 'Please enter a valid email address.'
        }

        if (form.phone.trim() === '') {
            errors.phone = 'This field is required.'
        } else if (!AUS_PHONE.test(cleanedPhone)) {
            errors.phone = 'Please enter a valid Australian phone number.'
        }

        if (form.password === '') {
            errors.password = 'This field is required.'
        } else if (form.password.length < 8) {
            errors.password = 'Password must be at least 8 characters.'
        }

        if (form.confirmPassword === '') {
            errors.confirmPassword = 'This field is required.'
        } else if (form.password !== form.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match. Please try again.'
        }

        return errors
    }

    function handleSubmit(evt) {
        evt.preventDefault()

        const errors = validate()

        if (Object.keys(errors).length > 0) {
            setErrors(errors)
            return
        }

        setErrors({})

    // Backend signup code will go here later
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF3E0' }}>
            <NavBar/>
            <GoldDivider/>
            <main style={{ flex: 1, display: 'flex' }}>
                {/*LEFT — Food photo */}
                <div style={{ width: '100%', display: 'flex' }}>
                    <div style={{ width: '50%', overflow: 'hidden' }}>
                    <img src="https://images.unsplash.com/photo-1544025162-d76594e18c0e?w=900&q=80" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(.88)' }} />
                </div>
                {/*  RIGHT — Form */}
                <div>
                    <div>

                    </div>
                </div>

                </div>
            </main>
            <Footer/>
        </div>
    )

}