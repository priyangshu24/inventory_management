"use client";

import { useAppDispatch, useAppSelector } from '@/app/redux';
import { setIsSidebarCollapsed } from '@/state';
import { Menu } from 'lucide-react'
import React from 'react'

const Sidebar = () => {

  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))
  };

  const sidebarClassName = `fixed flex flex-col ${isSidebarCollapsed ? "w-16" : "w-72 md:w-64"} bg-white transition-all duration-300 overflow-hidden h-full shadow-md z-40`

  return <div className={sidebarClassName}>
    {/* Logo */}
    <div className='flex gap-3 justify-between md:justify-normal items-center pt-8 px-4'>
        <div>logo</div>
        <h1 className='font-extrabold text-2xl'>EDSTOCK</h1>
    
    <button 
      className=' px-3 py-3 bg-gray-100 rounded-full hover:bg-blue-100' 
      onClick = {toggleSidebar}>
      <Menu className="w-6 h-6"/>
    </button>
    </div>
    {/* Links */}
    <div className='flex-grow mt-0'>
        {/* Links go here */}
    </div>

    {/* Footer */}
    <div>
        <p className='text-center text-xs text-gray-500'>@copy; 2025 EdStock</p>
    </div>

  </div>
}

export default Sidebar