'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        const isLoggedIn = localStorage.getItem("login") === "true";

        if (isLoggedIn) {
            console.log("Redirecting to /dashboard");
            router.push('/dashboard'); 
        } else {
            console.log("Redirecting to /auth");
            router.push('/auth');
        }
    }, [router]);

    return null; // No UI needed during redirect
}
