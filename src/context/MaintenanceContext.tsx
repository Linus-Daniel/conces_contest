"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface MaintenanceContextType {
  isMaintenanceMode: boolean;
  maintenanceMessage: string;
  setMaintenanceMode: (enabled: boolean) => void;
  setMaintenanceMessage: (message: string) => void;
  toggleMaintenanceMode: () => void;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

interface MaintenanceProviderProps {
  children: ReactNode;
}

export function MaintenanceProvider({ children }: MaintenanceProviderProps) {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean>(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>(
    'This page is currently under maintenance. We will be back soon. Get your phones ready to vote!'
  );

  // Load maintenance settings from localStorage on mount
  useEffect(() => {
    try {
      const storedMaintenanceMode = localStorage.getItem('voting_maintenance_mode');
      const storedMaintenanceMessage = localStorage.getItem('voting_maintenance_message');
      
      if (storedMaintenanceMode !== null) {
        setIsMaintenanceMode(JSON.parse(storedMaintenanceMode));
      }
      
      if (storedMaintenanceMessage) {
        setMaintenanceMessage(storedMaintenanceMessage);
      }
    } catch (error) {
      console.error('Error loading maintenance settings from localStorage:', error);
    }
  }, []);

  // Save maintenance settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('voting_maintenance_mode', JSON.stringify(isMaintenanceMode));
    } catch (error) {
      console.error('Error saving maintenance mode to localStorage:', error);
    }
  }, [isMaintenanceMode]);

  useEffect(() => {
    try {
      localStorage.setItem('voting_maintenance_message', maintenanceMessage);
    } catch (error) {
      console.error('Error saving maintenance message to localStorage:', error);
    }
  }, [maintenanceMessage]);

  const setMaintenanceMode = (enabled: boolean) => {
    setIsMaintenanceMode(enabled);
  };

  const updateMaintenanceMessage = (message: string) => {
    setMaintenanceMessage(message);
  };

  const toggleMaintenanceMode = () => {
    setIsMaintenanceMode(prev => !prev);
  };

  const contextValue: MaintenanceContextType = {
    isMaintenanceMode,
    maintenanceMessage,
    setMaintenanceMode,
    setMaintenanceMessage: updateMaintenanceMessage,
    toggleMaintenanceMode,
  };

  return (
    <MaintenanceContext.Provider value={contextValue}>
      {children}
    </MaintenanceContext.Provider>
  );
}

// Custom hook to use the maintenance context
export function useMaintenance() {
  const context = useContext(MaintenanceContext);
  if (context === undefined) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
}

// Maintenance banner component that can be used anywhere
export function MaintenanceBanner() {
  const { isMaintenanceMode, maintenanceMessage } = useMaintenance();

  if (!isMaintenanceMode) return null;

  return (
    <div className="bg-yellow-500 text-black px-4 py-3 text-center font-semibold border-b border-yellow-600">
      <div className="flex items-center justify-center gap-2">
        <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
        <span>{maintenanceMessage}</span>
        <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}

// Maintenance page component
export function MaintenancePage() {
  const { maintenanceMessage } = useMaintenance();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-conces-blue to-conces-green p-6">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h1 className="text-white text-3xl md:text-4xl font-bold mb-4 text-center">
            Maintenance Mode
          </h1>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <p className="text-white text-lg md:text-xl leading-relaxed text-center">
            {maintenanceMessage}
          </p>
        </div>
        
        <div className="mt-8 text-white/80 text-sm">
          <p>Thank you for your patience</p>
        </div>
      </div>
    </div>
  );
}

// HOC to wrap components with maintenance check
export function withMaintenanceCheck<P extends object>(
  Component: React.ComponentType<P>,
  showBannerOnly: boolean = false
) {
  return function MaintenanceWrappedComponent(props: P) {
    const { isMaintenanceMode } = useMaintenance();

    if (isMaintenanceMode && !showBannerOnly) {
      return <MaintenancePage />;
    }

    return (
      <>
        {showBannerOnly && <MaintenanceBanner />}
        <Component {...props} />
      </>
    );
  };
}