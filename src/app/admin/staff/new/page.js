//This page letting the admin create their staff account, they can also modify the role of the staff as well, either admin or staff
'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

const COLOR = {
    red: '#7B1A1A',
    redLight: '#FEF2F2',
    redBorder: '#FECACA',
    cream: '#FAF3E0',
    gold: '#C9A84C',
    text: '#1A1A1A',
    muted: '#6B7280',
    border: '#E5DCC8',
    white: '#FFFFFF',
    sidebar: '#F5EDD8',
}

const labelSt = {
    fontFamily: '"Lato", sans-serif',
    fontSize: '12px',
    fontWeight: 700,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: '.06em',
    width: '120px',
    flexShrink: 0,
}

const inputSt = {
    width: '100%',
    padding: '10px 12px',
    border: `1.5px solid ${COLOR.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: '"Lato", sans-serif',
    color: COLOR.text,
    background: COLOR.white,
    outline: 'none',
    boxSizing: 'border-box',
}

//components of the main create new staff page 

export default function NewStaffPage() {

    //declare variables

    const router = useRouter()

    //set role as staff as an initial variable
    const [role, setRole] = useState('STAFF')

    //for input fields
    const [firstName, setFirstName] = useState('')
    const [lastName, setlastName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false) //true when password become visible, set false as initial 
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null) //as no error message to show yet
    const [success, setSuccess] = useState(false)

    const isAdmin = role === 'ADMIN'

    //this function validate the form fields and then send a POST request to create a new account
    async function handleSubmit() {

        //check all required field if they are all filled in 
        //if not, display error message
        setError(null) //error has to be clear first to clean the prev error so the user gets a clean state each time they try to submit

        //ignore white space
        if (!firstName.trim()) {
            setError('First name is required!')
            return
        }
        else if (!lastName.trim()) {
            setError('Last name is required!')
            return
        }
        else if (!email.trim()) {
            setError('Email is required!')
            return
        }
        else if (!password.trim()) {
            setError('Password is required!')
            return
        }


        //check password is at least 8 characters
        //if not, display error message

        if (password.length < 8) {
            setError('Password must be at least 8 character')
            return
        }

        //set saving to true to show loading state on the button 
        setSaving(true)

        //Try to send POST request to api/admin/staff with the data filled
        //if the response fail, throw error message
        try {
            const res = await fetch('/api/admin/staff', {
                method: 'POST',
                headers: { 'Content-Type': application / json },
                body: JSON.stringify({
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                    email: email.trim(),
                    phone: phone.trim(),
                    password,
                    role

                }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error ?? 'Failed to create account')
            setSuccess(true)         //if success, set success to true to show the success message
            //if anything goes wrong, set the erro message and set saving to false again as now, saving is unsuccess
        } catch (err) {
            setError(err.message)
            setSaving(false)
        }


    }

    //if success, show the success message instead of forms
    if (success) {

        //show success message

        //show button to go back to staff list

        //reset all form fields and states back to their initial values

        return (
            <div style={{ display: 'flex', minHeight: '100vh', background: COLOR.cream, fontFamily: '"Lato", sans-serif' }}>
                <main style={{ flex: 1, padding: '40px 48px' }}>
                    <div style={{ maxWidth: '560px' }}>
                        <h1 style={{ fontFamily: '"Lato", serif', fontSize: '36px', fontWeight: 700, color: COLOR.red, margin: '0 0 32px' }}>
                            Create Account
                        </h1>
                        <div style={{ height: '2px', background: `linear-gradient(90deg, ${COLOR.gold}, transparent)`, marginBottom: '32px', borderRadius: '1px' }} />
                        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '36px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
                            <h2 style={{ fontFamily: '"Lato", sans-serif', fontSize: '20px', fontWeight: 700, color: '#166534', margin: '0 0 8px' }}>
                                Account Created
                            </h2>
                            <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '14px', color: '#166534', margin: '0 0 28px' }}>
                                The {isAdmin ? 'admin' : 'staff'} account for <strong>{firstName} {lastName}</strong> has been created.
                                Share the temporary password with them so they can log in.
                            </p>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                <button
                                    onClick={() => router.push('/admin/staff')}
                                    style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: COLOR.red, color: COLOR.white, fontFamily: '"Lato", sans-serif', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#5C1212'}
                                    onMouseLeave={e => e.currentTarget.style.background = COLOR.red}
                                >
                                    Back to Staff List
                                </button>
                                <button
                                    onClick={() => {
                                        setSuccess(false); setSaving(false)
                                        setFirstName(''); setLastName(''); setEmail(''); setPhone(''); setPassword('')
                                        setRole('STAFF')
                                    }}
                                    style={{ padding: '10px 24px', borderRadius: '8px', border: `1.5px solid ${COLOR.border}`, background: COLOR.white, color: COLOR.text, fontFamily: '"Lato", sans-serif', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    Create Another
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        )
    }




    //Form fields

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: COLOR.cream, fontFamily: '"Lato", sans-serif' }}>
            <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
                <div style={{ maxWidth: '560px' }}>

                    {/* Back link */}
                    <button
                        onClick={() => router.push('/admin/staff')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"Lato", sans-serif', fontSize: '14px', color: COLOR.muted, padding: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        onMouseEnter={e => e.currentTarget.style.color = COLOR.red}
                        onMouseLeave={e => e.currentTarget.style.color = COLOR.muted}
                    >
                        ← Back to Staff List
                    </button>

                    {/* Heading */}
                    <h1 style={{ fontFamily: '"Lato", serif', fontSize: '36px', fontWeight: 700, color: COLOR.red, margin: '0 0 32px' }}>
                        Create Account
                    </h1>

                    {/* Gold divider */}
                    <div style={{ height: '2px', background: `linear-gradient(90deg, ${COLOR.gold}, transparent)`, marginBottom: '32px', borderRadius: '1px' }} />

                    {/* Card */}
                    <div style={{ background: COLOR.white, borderRadius: '12px', padding: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

                        {/* Role toggle */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={labelSt}>Account Type</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {['STAFF', 'ADMIN'].map(r => {
                                    const active = role === r
                                    const color = r === 'ADMIN' ? COLOR.red : COLOR.gold
                                    return (
                                        <button
                                            key={r}
                                            onClick={() => setRole(r)}
                                            style={{
                                                flex: 1, padding: '11px', borderRadius: '8px',
                                                border: `1.5px solid ${active ? color : COLOR.border}`,
                                                background: active ? color : COLOR.white,
                                                color: active ? COLOR.white : COLOR.muted,
                                                fontSize: '14px', fontWeight: 700,
                                                fontFamily: '"Lato", sans-serif',
                                                cursor: 'pointer', transition: 'all .15s',
                                            }}
                                        >
                                            {r === 'STAFF' ? 'Staff' : 'Admin'}
                                        </button>
                                    )
                                })}
                            </div>
                            {isAdmin && (
                                <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '12px', color: '#B45309', margin: '8px 0 0', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '6px', padding: '8px 12px' }}>
                                    Admin accounts have full access to all settings, staff management, and reports
                                </p>
                            )}
                        </div>

                        {/* Name row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={labelSt}>First Name *</label>
                                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jane" style={inputSt} />
                            </div>
                            <div>
                                <label style={labelSt}>Last Name *</label>
                                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Smith" style={inputSt} />
                            </div>
                        </div>

                        {/* Email */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelSt}>Email *</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@goodwoodmeats.com.au" style={inputSt} />
                        </div>

                        {/* Phone */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelSt}>Phone (optional)</label>
                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="04xx xxx xxx" style={inputSt} />
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: '8px' }}>
                            <label style={labelSt}>Temporary Password *</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Min. 8 characters"
                                    style={{ ...inputSt, paddingRight: '44px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(p => !p)}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: COLOR.muted, fontSize: '18px', padding: 0, display: 'flex', alignItems: 'center' }}
                                >
                                    {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                                </button>
                            </div>
                            <p style={{ fontFamily: '"Lato", sans-serif', fontSize: '12px', color: '#9CA3AF', margin: '6px 0 0' }}>
                                Share this with the {isAdmin ? 'admin' : 'staff member'} — they can update it after logging in.
                            </p>
                        </div>

                        {error && (
                            <div style={{ background: COLOR.redLight, border: `1px solid ${COLOR.redBorder}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#B91C1C', fontFamily: '"Lato", sans-serif', marginTop: '16px' }}>
                                {error}
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                style={{
                                    flex: 1, padding: '12px',
                                    background: saving ? COLOR.muted : COLOR.red,
                                    color: COLOR.white, border: 'none', borderRadius: '8px',
                                    fontSize: '14px', fontWeight: 700, fontFamily: '"Lato", sans-serif',
                                    cursor: saving ? 'not-allowed' : 'pointer',
                                    transition: 'background .12s',
                                }}
                                onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#5C1212' }}
                                onMouseLeave={e => { if (!saving) e.currentTarget.style.background = COLOR.red }}
                            >
                                {saving ? 'Creating…' : `Create ${isAdmin ? 'Admin' : 'Staff'} Account`}
                            </button>
                            <button
                                onClick={() => router.push('/admin/staff')}
                                disabled={saving}
                                style={{
                                    padding: '12px 24px', background: COLOR.sidebar, color: COLOR.text,
                                    border: `1.5px solid ${COLOR.border}`, borderRadius: '8px',
                                    fontSize: '14px', fontWeight: 700, fontFamily: '"Lato", sans-serif',
                                    cursor: saving ? 'not-allowed' : 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )





}