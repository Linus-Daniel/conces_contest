
// src/components/Header.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  Bars3Icon, 
  MagnifyingGlassIcon, 
  BellIcon, 
  CogIcon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline'

interface HeaderProps {
  onSidebarToggle: () => void
}

export default function Header({ onSidebarToggle }: HeaderProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section */}
        <div className="flex items-center">
          <button
            onClick={onSidebarToggle}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 lg:hidden"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
          <div className="ml-3 lg:ml-0">
            <h1 className="text-lg font-semibold text-gray-800">ContestPro Admin</h1>
          </div>
        </div>
        
        {/* Search Bar (Hidden on Mobile) */}
        <div className="hidden md:flex items-center flex-1 max-w-xl mx-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>
        
        {/* Right Section */}
        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-md text-gray-600 hover:bg-gray-100 relative">
            <BellIcon className="w-5 h-5" />
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </button>
          
          <button className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
            <CogIcon className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-2"
            >
              <Image
                src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg"
                alt="Profile"
                width={32}
                height={32}
                className="rounded-full object-cover border border-gray-200"
              />
              <span className="text-sm font-medium text-gray-700 hidden md:block">
                Admin User
              </span>
              <ChevronDownIcon className="w-4 h-4 text-gray-500 hidden md:block" />
            </button>
            
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Your Profile
                </button>
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Settings
                </button>
                <div className="border-t border-gray-100"></div>
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
