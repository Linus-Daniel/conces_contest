




// components/admin/Header.tsx (Updated logout function)
// Update your existing header to use the context:

// Replace this part of your handleLogout function:
/*
const handleLogout = async () => {
  if (isLoggingOut) return;
  
  try {
    setIsLoggingOut(true);
    setProfileDropdownOpen(false);
    
    const response = await fetch('/api/admin/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      router.push('/admin/login');
      router.refresh();
    } else {
      console.error('Logout failed');
      alert('Logout failed. Please try again.');
    }
  } catch (error) {
    console.error('Logout error:', error);
    alert('Something went wrong during logout. Please try again.');
  } finally {
    setIsLoggingOut(false);
  }
};
*/

// With this:
/*
import { useAdminAuth } from '@/contexts/AdminAuthContext';

// In your component:
const { logout, isLoading: authLoading } = useAdminAuth();

const handleLogout = async () => {
  setProfileDropdownOpen(false);
  await logout();
};

// Update the button disabled state to:
disabled={authLoading}

// Update the loading check to:
{authLoading ? (
  // loading content
) : (
  // normal content
)}
*/

// Example usage in a protected page:
// app/admin/dashboard/page.tsx
/*
'use client';

import { useAdminAuth } from '@/contexts/AdminAuthContext';

export default function AdminDashboard() {
  const { user, isAuthenticated, logout } = useAdminAuth();

  if (!isAuthenticated) {
    return <div>Redirecting...</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
*/
