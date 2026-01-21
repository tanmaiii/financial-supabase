"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { userInitService } from "@/services/user-init.service";
import { useAuth } from "@/contexts/auth-context";

export default function DebugInitPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const handleCheckInit = async () => {
    if (!user) {
      addLog("❌ No user logged in");
      return;
    }

    setLoading(true);
    try {
      addLog(`Checking initialization for user: ${user.id}`);
      const isInit = await userInitService.checkUserInitialized(user.id);
      addLog(`✅ User initialized: ${isInit}`);
    } catch (error) {
      addLog(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInitUser = async () => {
    if (!user) {
      addLog("❌ No user logged in");
      return;
    }

    setLoading(true);
    try {
      addLog(`Initializing user: ${user.id}`);
      const initialized = await userInitService.initializeNewUser(user.id);
      if (initialized) {
        addLog("✅ User initialized successfully!");
      } else {
        addLog("ℹ️ User already has data");
      }
    } catch (error) {
      addLog(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!user) {
      addLog("❌ No user logged in");
      return;
    }

    if (!confirm("⚠️ This will DELETE ALL your data! Are you sure?")) {
      return;
    }

    setLoading(true);
    try {
      addLog(`⚠️ Resetting user data: ${user.id}`);
      await userInitService.resetUserData(user.id);
      addLog("✅ User data reset successfully!");
    } catch (error) {
      addLog(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">🔧 User Init Debug Tool</h1>

      <div className="grid gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>User Info</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-2">
                <p>
                  <strong>ID:</strong> {user.id}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
              </div>
            ) : (
              <p className="text-zinc-500">Not logged in</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleCheckInit}
              disabled={loading || !user}
              className="w-full"
              variant="outline"
            >
              Check if Initialized
            </Button>

            <Button
              onClick={handleInitUser}
              disabled={loading || !user}
              className="w-full"
            >
              Initialize User
            </Button>

            <Button
              onClick={handleReset}
              disabled={loading || !user}
              className="w-full"
              variant="destructive"
            >
              ⚠️ Reset User Data (Dangerous!)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Console Logs</CardTitle>
            <Button onClick={clearLogs} size="sm" variant="ghost">
              Clear
            </Button>
          </CardHeader>
          <CardContent>
            <div className="bg-zinc-950 text-zinc-50 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-zinc-500">No logs yet...</p>
              ) : (
                logs.map((log, index) => (
                  <p key={index} className="mb-1">
                    {log}
                  </p>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="text-amber-900 dark:text-amber-100">
            📝 Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="text-amber-900 dark:text-amber-100 space-y-2 text-sm">
          <p>1. Open Browser DevTools (F12) → Console tab</p>
          <p>
            2. Click Initialize User to create default categories and accounts
          </p>
          <p>3. Watch the console logs (both here and in DevTools)</p>
          <p>4. Check Supabase dashboard to verify data was created</p>
          <p className="pt-2 font-semibold">
            ⚠️ The Reset button will DELETE ALL your data!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
