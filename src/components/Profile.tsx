import { apiFetch } from '../lib/api';
import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Camera, Save, User as UserIcon, BookOpen, Clock, Zap, FileText, Target, Globe, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

export function Profile() {
  const { user, updateUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    learningGoal: user?.learningGoal || '',
    preferredLanguage: user?.preferredLanguage || 'English',
    timeZone: user?.timeZone || 'UTC',
    avatar: user?.avatar || ''
  });
  const [loading, setLoading] = useState(false);
  
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

  if (!user) return null;

  return (
    <div className="container mx-auto p-4 max-w-5xl space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column - Profile Info */}
        <div className="w-full md:w-1/3 space-y-6">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-4 border-background shadow-sm">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-12 h-12 text-primary/50" />
                  )}
                </div>
                {isEditing && (
                  <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-sm">
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground text-sm">{user.email}</p>
              
              <div className="mt-6 w-full space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Account Type</span>
                  <span className="font-medium capitalize">{user.subscriptionPlan || 'Free'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Member Since</span>
                  <span className="font-medium">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Study Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 p-3 rounded-lg text-center">
                  <FileText className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                  <div className="text-xl font-bold">12</div>
                  <div className="text-xs text-muted-foreground">Documents</div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg text-center">
                  <BookOpen className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
                  <div className="text-xl font-bold">45</div>
                  <div className="text-xs text-muted-foreground">Notes</div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg text-center">
                  <Zap className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                  <div className="text-xl font-bold">128</div>
                  <div className="text-xs text-muted-foreground">Flashcards</div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg text-center">
                  <Target className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                  <div className="text-xl font-bold">15</div>
                  <div className="text-xs text-muted-foreground">Quizzes</div>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm bg-muted/30 p-2 rounded">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-orange-500" />
                    <span>Study Streak</span>
                  </div>
                  <span className="font-bold">5 Days</span>
                </div>
                <div className="flex items-center justify-between text-sm bg-muted/30 p-2 rounded">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>Total Hours</span>
                  </div>
                  <span className="font-bold">24h 30m</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Edit Profile */}
        <div className="w-full md:w-2/3">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>Manage your personal information and learning preferences</CardDescription>
              </div>
              {!isEditing ? (
                <Button variant="outline" onClick={() => setIsEditing(true)}>Edit Profile</Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button onClick={handleSave} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    disabled={!isEditing} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    value={user.email} 
                    disabled 
                    className="bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed directly.</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Tell us a bit about yourself..."
                  value={formData.bio} 
                  onChange={e => setFormData({...formData, bio: e.target.value})} 
                  disabled={!isEditing}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="learningGoal">Primary Learning Goal</Label>
                  <Input 
                    id="learningGoal" 
                    placeholder="e.g. Master Machine Learning"
                    value={formData.learningGoal} 
                    onChange={e => setFormData({...formData, learningGoal: e.target.value})} 
                    disabled={!isEditing} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar Image</Label>
                  <div className="flex items-center gap-4">
                    {formData.avatar && (
                      <img src={formData.avatar} alt="Avatar Preview" className="h-10 w-10 rounded-full object-cover border" />
                    )}
                    <Input 
                      id="avatar" 
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload} 
                      disabled={!isEditing} 
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Preferred Language</Label>
                  <Select 
                    disabled={!isEditing} 
                    value={formData.preferredLanguage}
                    onValueChange={(val) => setFormData({...formData, preferredLanguage: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="Chinese">Chinese</SelectItem>
                      <SelectItem value="Japanese">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Time Zone</Label>
                  <Select 
                    disabled={!isEditing}
                    value={formData.timeZone}
                    onValueChange={(val) => setFormData({...formData, timeZone: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Time Zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time (US)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (US)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (US)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (US)</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Central European Time</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
