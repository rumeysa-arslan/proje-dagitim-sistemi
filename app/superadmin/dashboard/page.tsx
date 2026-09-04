/*
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import Navbar from '@/components/Navbar';


export default function SuperAdminPage(){
    const router = useRouter();
    const [currentUserId, setCurrentUserId] = useState('');


useEffect(() => {
    const superAdmin = localStorage.getItem('superAdmin');
    if (!superAdmin) return router.push('/superadmin/login');
    const parsed = JSON.parse(superAdmin);
    if () return router.push('/superadmin/login');
    setCurrentUserId(parsed);
  }, [router]);



}
*/
