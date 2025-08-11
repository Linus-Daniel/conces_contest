
// src/app/page.tsx
'use client'

import { useState } from 'react'
import Header from '@/components/admin/Header'
import UserManagement from '@/components/admin/Contestants'
import VoteManagement from '@/components/admin/Votes'
import ContestManagement from '@/components/admin/Contest'
import Sidebar from '@/components/admin/SideBar'
type TabType = 'users' | 'votes' | 'contests'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('users')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />
      case 'votes':
        return <VoteManagement />
      case 'contests':
        return <ContestManagement />
      default:
        return <UserManagement />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <div className="flex-1 flex flex-col">
        <Header onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:ml-64">
          <div className="mb-6">
            <div className="flex items-center text-sm text-gray-500">
              <span className="hover:text-primary-600 cursor-pointer">Dashboard</span>
              <svg className="mx-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700 font-medium">
                {activeTab === 'users' && 'User Management'}
                {activeTab === 'votes' && 'Vote Management'}
                {activeTab === 'contests' && 'Contest Management'}
              </span>
            </div>
          </div>

          {renderContent()}
        </main>
      </div>
    </div>
  )
}

