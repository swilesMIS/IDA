"use client";

import React from 'react'
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { signIn, signOut, useSession, getProviders } from 'next-auth/react';

const Nav = () => {

const isUserLoggedIn = true;
// const [providers, setProviders ] = useState(null);


// useEffect(() => {
//     const setProviders = async () => {
//         const response = await getProviders();

//         setProviders(response);
//     }

//     setProviders();
// }, [])
  return (
    <nav className='flex-between w-full mb-16 pt-3'>
        <div className='sm:flex hidden'>
            {isUserLoggedIn ? (
                <div className='flex md:gap-5'>
                    <button type='button' onClick={signOut} className='outline_btn'>Sign Out</button>
                </div>
            ) : (
                <div>
                    <button>Sign In</button>
                {/*This is for sign in function. University signin? */}
                </div>
                
            )}
        </div>
    </nav>
  )
}


export default Nav