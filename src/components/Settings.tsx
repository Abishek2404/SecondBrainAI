import { apiFetch } from '../lib/api';
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LogOut, Shield, Key, Bell, Palette, Globe, MonitorSmartphone, Database, Wifi, WifiOff, CloudLightning, RotateCw, Trash2, CheckCircle2 } from 'lucide-react';
import { Switch } from './ui/switch';
import { useTheme } from 'next-themes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

import { useNotifications } from '../lib/useNotifications';
import { getSyncQueue, syncOfflineQueue, initDb } from '../lib/offlineDb';

export function Settings() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { enabled, toggleNotifications } = useNotifications();
  const [mounted, setMounted] = useState(false);
  
  const [offlineSimulated, setOfflineSimulated] = useState(false);
  const [cacheCount, setCacheCount] = useState(0);
  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [syncingOffline, setSyncingOffline] = useState(false);

  const getCacheCount = async (): Promise<number> => {
    try {
      const db = await initDb();
      return new Promise((resolve) => {
        const transaction = db.transaction("caches", "readonly");
        const store = transaction.objectStore("caches");
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(0);
      });
    } catch (err) {
      return 0;
    }
  };

  const clearLocalCaches = async (): Promise<void> => {
    try {
      const db = await initDb();
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction("caches", "readwrite");
        const store = transaction.objectStore("caches");
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error(err);
    }
  };

  const loadSyncMetrics = async () => {
    const q = await getSyncQueue();
    setQueueItems(q);
    const count = await getCacheCount();
    setCacheCount(count);
  };

  useEffect(() => {
    setMounted(true);
    setOfflineSimulated(localStorage.getItem('offline_simulator') === 'true');
    loadSyncMetrics();

    const handleSyncComplete = () => {
      loadSyncMetrics();
    };
    window.addEventListener('offline-sync-complete', handleSyncComplete);
    return () => {
      window.removeEventListener('offline-sync-complete', handleSyncComplete);
    };
  }, []);

  const handleToggleOffline = (val: boolean) => {
    if (val) {
      localStorage.setItem('offline_simulator', 'true');
      setOfflineSimulated(true);
      toast.warning('Offline Simulation Mode is active!', {
        description: 'Requests will use local IndexedDB. You can test fully offline.'
      });
    } else {
      localStorage.removeItem('offline_simulator');
      setOfflineSimulated(false);
      toast.success('Offline Simulation disabled!', {
        description: 'Starting queue synchronization...'
      });
      triggerManualSync();
    }
    loadSyncMetrics();
  };

  const triggerManualSync = async () => {
    if (localStorage.getItem('offline_simulator') === 'true') {
      toast.error('Cannot sync while simulating offline mode.');
      return;
    }
    setSyncingOffline(true);
    try {
      await syncOfflineQueue();
    } catch (e) {
      toast.error('Offline synchronization failed.');
    } finally {
      setSyncingOffline(false);
      loadSyncMetrics();
    }
  };

  const handleClearCache = async () => {
    if (window.confirm('Are you sure you want to clear your offline cache? Future resources will re-fetch from servers.')) {
      await clearLocalCaches();
      toast.success('Offline caches cleared!');
      loadSyncMetrics();
    }
  };
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Password updated successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.error || 'Failed to update password');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    toast.success('Logged out from all devices');
    // Implement actual logic later if needed
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className={`grid w-full mb-8 ${(user?.hasPassword || user?.provider !== 'google') ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          {(user?.hasPassword || user?.provider !== 'google') && (
            <TabsTrigger value="security">Security</TabsTrigger>
          )}
          <TabsTrigger value="offlineSync">Offline Sync</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Update your email address or manage your subscription.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ''} disabled />
                <p className="text-xs text-muted-foreground">To change your email, please contact support.</p>
              </div>
              <div className="space-y-2">
                <Label>Subscription</Label>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md border">
                  <div>
                    <p className="font-medium capitalize">{user?.subscriptionPlan || 'Free'} Plan</p>
                    <p className="text-sm text-muted-foreground">You are currently on the free tier.</p>
                  </div>
                  <Button variant="outline">Upgrade</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance & Theme</CardTitle>
              <CardDescription>Customize how SecondBrain AI looks on your device.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Theme</Label>
                  <p className="text-sm text-muted-foreground">Select your preferred color theme.</p>
                </div>
                <Select value={mounted ? theme : 'system'} onValueChange={setTheme}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light"><div className="flex items-center gap-2"><Palette className="w-4 h-4" /> Light</div></SelectItem>
                    <SelectItem value="dark"><div className="flex items-center gap-2"><Palette className="w-4 h-4" /> Dark</div></SelectItem>
                    <SelectItem value="system"><div className="flex items-center gap-2"><MonitorSmartphone className="w-4 h-4" /> System</div></SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Choose what updates you want to receive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="study-reminders" className="flex flex-col space-y-1">
                  <span>Study Reminders</span>
                  <span className="font-normal text-sm text-muted-foreground">Get reminded about your daily study goals.</span>
                </Label>
                <Switch id="study-reminders" checked={enabled} onCheckedChange={toggleNotifications} />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="product-updates" className="flex flex-col space-y-1">
                  <span>Product Updates</span>
                  <span className="font-normal text-sm text-muted-foreground">Receive emails about new features and improvements.</span>
                </Label>
                <Switch id="product-updates" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {(user?.hasPassword || user?.provider !== 'google') && (
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
              </CardHeader>
              <form onSubmit={handlePasswordChange}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input 
                      id="current-password" 
                      type="password" 
                      value={passwordData.currentPassword}
                      onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="new-password" 
                      type="password" 
                      value={passwordData.newPassword}
                      onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      value={passwordData.confirmPassword}
                      onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      required 
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Password'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-red-500">Danger Zone</CardTitle>
              <CardDescription>Actions here cannot be undone.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Logout of all devices</h4>
                  <p className="text-sm text-muted-foreground">Log out from all other active sessions across your devices.</p>
                </div>
                <Button variant="outline" onClick={handleLogoutAll}>Log out all</Button>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <h4 className="font-medium text-red-500">Delete Account</h4>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data.</p>
                </div>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offlineSync" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Offline Sync Manager
                    {offlineSimulated ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 text-[11px] font-semibold animate-pulse">
                        <WifiOff className="w-3.5 h-3.5" /> Simulated Offline
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 text-[11px] font-semibold">
                        <Wifi className="w-3.5 h-3.5" /> Synchronized
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Configure local-first offline storage and inspect your synchronization sync queues.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold flex items-center gap-1.5">
                    Simulate Offline Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Disconnect the application from the server to test IndexedDB caching and offline functionality.
                  </p>
                </div>
                <Switch 
                  id="offline-sim-switch" 
                  checked={offlineSimulated} 
                  onCheckedChange={handleToggleOffline} 
                />
              </div>

              {/* Database stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-card border rounded-xl flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <Database className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Local Cached Endpoints</p>
                    <p className="text-xl font-bold">{cacheCount} cached path(s)</p>
                  </div>
                </div>

                <div className="p-4 bg-card border rounded-xl flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center shrink-0">
                    <CloudLightning className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Unsynced Queue Size</p>
                    <p className="text-xl font-bold">{queueItems.length} action(s) pending</p>
                  </div>
                </div>
              </div>

              {/* Queue Log List */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Offline Operations Sync Queue</Label>
                {queueItems.length > 0 ? (
                  <div className="border rounded-xl divide-y overflow-hidden max-h-[250px] overflow-y-auto">
                    {queueItems.map((item, index) => {
                      let actionName = "Modify Resource";
                      let color = "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10";
                      
                      if (item.url.includes("/api/notes")) {
                        actionName = item.method === "DELETE" ? "DELETE Note" : "CREATE/UPDATE Note";
                        color = item.method === "DELETE" ? "text-rose-600 bg-rose-50 dark:bg-rose-500/10" : "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10";
                      } else if (item.url.includes("/api/flashcards")) {
                        actionName = item.method === "DELETE" ? "DELETE Deck" : "REVIEW Flashcards";
                        color = item.method === "DELETE" ? "text-rose-600 bg-rose-50" : "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10";
                      } else if (item.url.includes("/api/quizzes")) {
                        actionName = item.method === "DELETE" ? "DELETE Quiz" : "SUBMIT Quiz Attempt";
                        color = item.method === "DELETE" ? "text-rose-600 bg-rose-50" : "text-amber-600 bg-amber-50 dark:bg-amber-500/10";
                      } else if (item.url.includes("/api/planner")) {
                        actionName = "UPDATE Study Planner Tasks";
                        color = "text-blue-600 bg-blue-50 dark:bg-blue-500/10";
                      }

                      return (
                        <div key={index} className="flex items-center justify-between p-3 text-xs bg-card/50">
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="font-semibold text-foreground truncate">{item.url}</span>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${color}`}>{actionName}</span>
                              <span className="text-muted-foreground">{new Date(item.timestamp).toLocaleTimeString()}</span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 border border-amber-100 font-medium text-[10px] shrink-0 animate-pulse">
                            Pending Sync
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center text-muted-foreground bg-muted/10 border border-dashed rounded-xl text-sm">
                    No offline actions pending synchronization. Your local state matches the cloud!
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                onClick={triggerManualSync} 
                disabled={syncingOffline || offlineSimulated || queueItems.length === 0}
                className="flex items-center gap-2 animate-none"
              >
                <RotateCw className={`w-4 h-4 ${syncingOffline ? "animate-spin" : ""}`} />
                {syncingOffline ? "Synchronizing..." : "Synchronize Queue"}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleClearCache}
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear Local Cache
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
