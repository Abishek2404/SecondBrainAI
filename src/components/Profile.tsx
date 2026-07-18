import { apiFetch } from '../lib/api';
import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Camera, Save, User as UserIcon, BookOpen, Clock, Zap, FileText, Target, Globe, Calendar, CheckCircle2, Crown, Bell, Shield, LogOut } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

export function Profile() {
  const { user, updateUser, logout } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    learningGoal: user?.learningGoal || '',
    preferredLanguage: user?.preferredLanguage || 'English',
    timeZone: user?.timeZone || 'UTC',
    avatar: user?.avatar || ''
  });
  const [loading, setLoading] = useState(false);
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weeklyReport: true,
    newFeatures: false
  });

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiFetch('/api/dashboard');
        if (res.ok) {
          const json = await res.json();
          setStats(json.data);
        }
      } catch (error) {
        console.error("Error fetching stats", error);
      }
    };
    fetchAnalytics();
  }, []);
  
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const uploadData = new FormData();
    uploadData.append('avatar', file);
    
    try {
      const res = await apiFetch('/api/auth/profile/avatar', {
        method: 'POST',
        body: uploadData,
      });
      const data = await res.json();
      if (res.ok) {
        setFormData(prev => ({ ...prev, avatar: data.data.avatar }));
        updateUser({ ...user, ...data.data });
        toast.success("Avatar uploaded successfully");
      } else {
        toast.error(data.error || "Failed to upload avatar");
      }
    } catch (err) {
      toast.error("An error occurred during upload");
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        updateUser({ ...user, ...data.data });
        setIsEditing(false);
        toast.success('Profile updated successfully');
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => {
      const newState = { ...prev, [key]: !prev[key] };
      toast.success("Notification preferences updated");
      return newState;
    });
  };

  if (!user) return null;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Account Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your profile, preferences, and subscription.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <Card className="rounded-3xl border shadow-sm overflow-hidden bg-card">
            <CardContent className="pt-8 flex flex-col items-center text-center px-6 pb-8">
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center overflow-hidden shadow-sm">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-16 h-16 text-indigo-500/50" />
                  )}
                </div>
                {isEditing && (
                  <Button size="icon" className="absolute -bottom-2 -right-2 rounded-xl h-10 w-10 shadow-md bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Camera className="h-4 w-4" />
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleAvatarUpload} />
                  </Button>
                )}
              </div>
              <h2 className="text-2xl font-bold tracking-tight">{user.name}</h2>
              <p className="text-muted-foreground text-sm mb-6">{user.email}</p>
              
              <div className="w-full rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-5 text-white shadow-md relative overflow-hidden">
                <div className="absolute right-0 top-0 p-4 opacity-10">
                  <Crown className="h-16 w-16" />
                </div>
                <div className="flex items-center gap-2 mb-1 relative z-10">
                  <Crown className="h-4 w-4 text-indigo-200" />
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">Current Plan</span>
                </div>
                <div className="text-2xl font-black relative z-10 capitalize mb-4">{user.subscriptionPlan || 'Pro'}</div>
                <Button className="w-full bg-white text-indigo-600 hover:bg-white/90 rounded-xl h-9 text-xs font-bold shadow-sm relative z-10">
                  Manage Subscription
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold">Lifetime Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 p-4 rounded-2xl flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="h-4 w-4 text-orange-500" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Streak</span>
                  </div>
                  <div className="text-2xl font-black">{stats ? `${stats.studyStreak || 0}` : '-'}</div>
                </div>
                <div className="bg-muted/50 p-4 rounded-2xl flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Hours</span>
                  </div>
                  <div className="text-2xl font-black">{stats ? `${Math.floor(stats.totalStudyHours || 0)}` : '-'}</div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 mt-4">
                {[
                  { label: "Documents Processed", value: stats ? stats.totalDocuments || 0 : '-', icon: FileText, color: "text-blue-500" },
                  { label: "Notes Generated", value: stats ? stats.totalNotes || 0 : '-', icon: BookOpen, color: "text-emerald-500" },
                  { label: "Quizzes Completed", value: stats ? stats.totalQuizzesTaken || 0 : '-', icon: Target, color: "text-purple-500" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg bg-background border shadow-sm flex items-center justify-center shrink-0`}>
                        <item.icon className={`h-4 w-4 ${item.color}`} />
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <span className="font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Edit Profile */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <Card className="rounded-3xl border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-6 mb-6">
              <div>
                <CardTitle className="text-xl font-bold">Personal Information</CardTitle>
                <CardDescription>Update your personal details and learning goals</CardDescription>
              </div>
              {!isEditing ? (
                <Button variant="outline" className="rounded-xl h-10 px-6 font-semibold" onClick={() => setIsEditing(true)}>Edit Profile</Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" className="rounded-xl h-10 px-4 font-semibold" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button className="rounded-xl h-10 px-6 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSave} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Full Name</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    disabled={!isEditing} 
                    className="h-12 rounded-xl bg-muted/30 font-medium"
                  />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Email Address</Label>
                  <Input 
                    id="email" 
                    value={user.email} 
                    disabled 
                    className="h-12 rounded-xl bg-muted/50 font-medium opacity-70"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="bio" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Bio</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Tell us a bit about yourself..."
                  value={formData.bio} 
                  onChange={e => setFormData({...formData, bio: e.target.value})} 
                  disabled={!isEditing}
                  rows={4}
                  className="rounded-xl bg-muted/30 font-medium resize-none p-4"
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="learningGoal" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Primary Learning Goal</Label>
                <Input 
                  id="learningGoal" 
                  placeholder="e.g. Master Machine Learning"
                  value={formData.learningGoal} 
                  onChange={e => setFormData({...formData, learningGoal: e.target.value})} 
                  disabled={!isEditing} 
                  className="h-12 rounded-xl bg-muted/30 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Preferred Language</Label>
                  <Select disabled={!isEditing} value={formData.preferredLanguage} onValueChange={(val) => setFormData({...formData, preferredLanguage: val})}>
                    <SelectTrigger className="h-12 rounded-xl bg-muted/30 font-medium">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="English" className="rounded-lg">English</SelectItem>
                      <SelectItem value="Spanish" className="rounded-lg">Spanish</SelectItem>
                      <SelectItem value="French" className="rounded-lg">French</SelectItem>
                      <SelectItem value="German" className="rounded-lg">German</SelectItem>
                      <SelectItem value="Chinese" className="rounded-lg">Chinese</SelectItem>
                      <SelectItem value="Japanese" className="rounded-lg">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2.5">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Time Zone</Label>
                  <Select disabled={!isEditing} value={formData.timeZone} onValueChange={(val) => setFormData({...formData, timeZone: val})}>
                    <SelectTrigger className="h-12 rounded-xl bg-muted/30 font-medium">
                      <SelectValue placeholder="Select Time Zone" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="UTC" className="rounded-lg">UTC</SelectItem>
                      <SelectItem value="America/New_York" className="rounded-lg">Eastern Time (US)</SelectItem>
                      <SelectItem value="America/Chicago" className="rounded-lg">Central Time (US)</SelectItem>
                      <SelectItem value="America/Denver" className="rounded-lg">Mountain Time (US)</SelectItem>
                      <SelectItem value="America/Los_Angeles" className="rounded-lg">Pacific Time (US)</SelectItem>
                      <SelectItem value="Europe/London" className="rounded-lg">London</SelectItem>
                      <SelectItem value="Europe/Paris" className="rounded-lg">Central European Time</SelectItem>
                      <SelectItem value="Asia/Tokyo" className="rounded-lg">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border shadow-sm">
            <CardHeader className="border-b pb-6 mb-6">
              <CardTitle className="text-xl font-bold flex items-center gap-2"><Bell className="h-5 w-5 text-indigo-500" /> Notifications</CardTitle>
              <CardDescription>Control how we contact you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0">
               {[
                 { id: 'email', label: 'Email Notifications', desc: 'Receive important account updates via email' },
                 { id: 'push', label: 'Push Notifications', desc: 'Get reminded about study sessions and streaks' },
                 { id: 'weeklyReport', label: 'Weekly Report', desc: 'A summary of your learning progress every Sunday' },
                 { id: 'newFeatures', label: 'New Features', desc: 'Updates about new AI capabilities and platform features' }
               ].map((item, idx) => (
                 <div key={item.id} className={`flex items-center justify-between py-4 ${idx !== 3 ? 'border-b' : ''}`}>
                   <div className="flex flex-col gap-1">
                     <span className="font-semibold text-sm">{item.label}</span>
                     <span className="text-xs text-muted-foreground">{item.desc}</span>
                   </div>
                   <button 
                     onClick={() => toggleNotification(item.id as keyof typeof notifications)}
                     className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${notifications[item.id as keyof typeof notifications] ? 'bg-indigo-600' : 'bg-muted'}`}
                   >
                     <span className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${notifications[item.id as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0'}`} />
                   </button>
                 </div>
               ))}
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
             <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-xl h-12 px-6 gap-2 font-bold" onClick={logout}>
               <LogOut className="h-4 w-4" /> Sign Out
             </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
