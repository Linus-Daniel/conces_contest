"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Power, 
  PowerOff, 
  Edit3, 
  Save, 
  X, 
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { useMaintenance } from '@/context/MaintenanceContext';
import toast from 'react-hot-toast';

export default function MaintenanceControl() {
  const {
    isMaintenanceMode,
    maintenanceMessage,
    setMaintenanceMode,
    setMaintenanceMessage,
    toggleMaintenanceMode,
  } = useMaintenance();

  const [isEditing, setIsEditing] = useState(false);
  const [tempMessage, setTempMessage] = useState(maintenanceMessage);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleToggleMaintenance = () => {
    if (isMaintenanceMode) {
      // If currently in maintenance mode, ask for confirmation before disabling
      setShowConfirm(true);
    } else {
      // If not in maintenance mode, enable it immediately
      toggleMaintenanceMode();
      toast.success('Maintenance mode enabled');
    }
  };

  const confirmToggle = () => {
    toggleMaintenanceMode();
    setShowConfirm(false);
    toast.success(isMaintenanceMode ? 'Maintenance mode disabled' : 'Maintenance mode enabled');
  };

  const handleSaveMessage = () => {
    setMaintenanceMessage(tempMessage);
    setIsEditing(false);
    toast.success('Maintenance message updated');
  };

  const handleCancelEdit = () => {
    setTempMessage(maintenanceMessage);
    setIsEditing(false);
  };

  const presetMessages = [
    'This page is currently under maintenance. We will be back soon. Get your phones ready to vote!',
    'Voting is temporarily unavailable while we perform system updates. Please check back in a few minutes.',
    'We are currently experiencing technical difficulties. Our team is working to resolve this quickly.',
    'Scheduled maintenance in progress. Voting will resume shortly.',
    'System upgrade in progress. Thank you for your patience.',
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Maintenance Control</h2>
          <p className="text-gray-600 text-sm">Manage voting page maintenance mode</p>
        </div>
      </div>

      {/* Status Card */}
      <div className={`rounded-xl p-4 mb-6 border-2 ${
        isMaintenanceMode 
          ? 'bg-red-50 border-red-200 text-red-800' 
          : 'bg-green-50 border-green-200 text-green-800'
      }`}>
        <div className="flex items-center gap-3">
          {isMaintenanceMode ? (
            <AlertTriangle className="w-6 h-6" />
          ) : (
            <CheckCircle className="w-6 h-6" />
          )}
          <div>
            <div className="font-semibold">
              {isMaintenanceMode ? 'Maintenance Mode Active' : 'System Operational'}
            </div>
            <div className="text-sm opacity-80">
              {isMaintenanceMode 
                ? 'Voting pages are currently showing maintenance message'
                : 'All voting pages are accessible to users'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Control */}
      <div className="space-y-4">
        <motion.button
          onClick={handleToggleMaintenance}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg transition-all ${
            isMaintenanceMode
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg'
              : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg'
          }`}
        >
          {isMaintenanceMode ? (
            <>
              <Power className="w-6 h-6" />
              Enable Voting
            </>
          ) : (
            <>
              <PowerOff className="w-6 h-6" />
              Enable Maintenance Mode
            </>
          )}
        </motion.button>

        {/* Message Editor */}
        <div className="border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="font-semibold text-gray-900">Maintenance Message</label>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 text-conces-blue hover:text-blue-700 text-sm font-medium"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveMessage}
                  className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm font-medium"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={tempMessage}
                onChange={(e) => setTempMessage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-conces-blue/20 focus:border-conces-blue resize-none"
                rows={3}
                placeholder="Enter maintenance message..."
              />
              
              {/* Preset Messages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quick Templates:</label>
                <div className="space-y-2">
                  {presetMessages.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => setTempMessage(preset)}
                      className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border text-gray-700 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-gray-700">{maintenanceMessage}</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-blue-800 text-sm">
              <div className="font-semibold mb-1">How it works:</div>
              <ul className="space-y-1 text-blue-700">
                <li>• When enabled, maintenance mode replaces voting pages with the message above</li>
                <li>• Users will see the maintenance page instead of the voting interface</li>
                <li>• Settings are saved automatically and persist across browser sessions</li>
                <li>• You can customize the message to inform users about expected downtime</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Disable Maintenance Mode?
              </h3>
              <p className="text-gray-600">
                This will make the voting pages accessible to all users again.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmToggle}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
              >
                Enable Voting
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}