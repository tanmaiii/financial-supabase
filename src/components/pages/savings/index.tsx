"use client";

import { useState } from "react";
import SavingsHeader from "./savings-header";
import SavingsStats from "./savings-stats";
import ActiveGoals from "./active-goals";
import AddSavingsModal from "./add-savings-modal";

export default function Savings() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleRefresh = () => {
    // This will trigger a re-render of stats
    window.location.reload();
  };

  const handleAddGoalSuccess = () => {
    handleRefresh();
  };

  return (
    <>
      <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
        <SavingsHeader onAddGoal={() => setIsAddModalOpen(true)} />
        <SavingsStats />
        <ActiveGoals onRefresh={handleRefresh} />
      </div>

      <AddSavingsModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddGoalSuccess}
      />
    </>
  );
}
