"use client";
import React from 'react';
import { motion } from 'framer-motion';
import MaintenanceControl from '@/components/admin/MaintenanceControl';

export default function MaintenancePage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Maintenance Management
        </h1>
        <p className="text-gray-600">
          Control voting page maintenance mode and customize maintenance messages for users.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <MaintenanceControl />
      </motion.div>
    </div>
  );
}