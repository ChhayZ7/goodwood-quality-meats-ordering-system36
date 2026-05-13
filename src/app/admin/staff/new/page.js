//This page letting the admin create their staff account, they can also modify the role of the staff as well, either admin or staff

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    const [showPassword, setShowPassword] = useState(fasle) //true when password become visible, set false as initial 
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null) //as no error message to show yet
    const [success, setSuccess] = useState(fasle)

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
        else if (!password.trim()){
            setError('Password is required!')
            return
        }


        //check password is at least 8 characters
        //if not, display error message

        if(password.length < 8) { 
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
                headers: {'Content-Type': application/json},
                body: JSON.stringify ({
                    first_name: firstName.trim(),
                    last_name: lastName.trim(), 
                    email: email.trim(),
                    phone: phone.trim(),
                    password,
                    role
                    
                }),
            })

            const data = await res.json()
            if(!res.ok) throw new Error (data.error ?? 'Failed to create account')
            setSuccess(true)         //if success, set success to true to show the success message
        //if anything goes wrong, set the erro message and set saving to false again as now, saving is unsuccess
        }catch (err) {
            setError (err.message) 
            setSaving(false)
        }


    }

    //if success, show the success message instead of forms
    if (success) {

        //show success message

        //show button to go back to staff list

        //reset all form fields and states back to their initial values

    }


    //Form fields

    return (
        null
    )




}