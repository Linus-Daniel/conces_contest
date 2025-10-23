"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useMaintenance, MaintenanceBanner, withMaintenanceCheck } from '@/context/MaintenanceContext';
import { AlertTriangle, CheckCircle, Settings } from 'lucide-react';

// Example component that shows maintenance banner but still renders content
const ComponentWithBanner = withMaintenanceCheck(() => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Component with Banner</h3>
    <p className="text-gray-600">
      This component shows a maintenance banner when maintenance mode is enabled, 
      but still renders its content below.
    </p>
  </div>
), true);

// Example component that gets completely replaced by maintenance page
const ComponentWithFullReplacement = withMaintenanceCheck(() => (
  <div className="bg-white p-6 rounded-lg shadow-sm border">
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Component with Full Replacement</h3>
    <p className="text-gray-600">
      This component gets completely replaced with the maintenance page when 
      maintenance mode is enabled.
    </p>
  </div>
));

// Manual implementation example
function ManualMaintenanceCheck() {
  const { isMaintenanceMode, maintenanceMessage } = useMaintenance();

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Manual Implementation</h3>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {isMaintenanceMode ? (
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
          <span className="text-gray-700">
            Maintenance Mode: {isMaintenanceMode ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        {isMaintenanceMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              <strong>Current Message:</strong> {maintenanceMessage}
            </p>
          </div>
        )}
        
        <p className="text-gray-600 text-sm">
          This component manually checks the maintenance state and shows different 
          content based on the current mode.
        </p>
      </div>
    </div>
  );
}

export default function MaintenanceDemo() {
  const { isMaintenanceMode, toggleMaintenanceMode } = useMaintenance();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow-sm border"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Maintenance Context Demo
            </h2>
          </div>
          
          <button
            onClick={toggleMaintenanceMode}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isMaintenanceMode
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            {isMaintenanceMode ? 'Disable' : 'Enable'} Maintenance
          </button>
        </div>
        
        <p className="text-gray-600">
          This demo shows different ways to implement maintenance mode in your components.
          Use the toggle button above to test the different behaviors.
        </p>
      </motion.div>

      {/* Standalone banner component */}
      <MaintenanceBanner />

      {/* Component with banner only */}
      <ComponentWithBanner />

      {/* Manual implementation */}
      <ManualMaintenanceCheck />

      {/* Component with full replacement */}
      <ComponentWithFullReplacement />
    </div>
  );
}