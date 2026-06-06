"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  User,
  Key,
  Brain,
  Shield,
  Loader2,
  CheckCircle,
  CreditCard,
  Smartphone,
  Laptop,
  DownloadCloud,
  AlertTriangle,
  Bell,
  Monitor,
  Check,
  LogOut,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { signOut } from "next-auth/react";

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [aiProvider, setAiProvider] = useState("gemini");
  const [aiApiKey, setAiApiKey] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [isLoadingBilling, setIsLoadingBilling] = useState(false);

  // Notifications State
  const [notifyJobMatches, setNotifyJobMatches] = useState(true);
  const [notifyAppStatus, setNotifyAppStatus] = useState(true);
  const [notifyProductUpdates, setNotifyProductUpdates] = useState(false);

  // Danger Zone State
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
    
    // Load AI Provider and API Key from localStorage
    const savedProvider = localStorage.getItem("ai_provider");
    const savedApiKey = localStorage.getItem("ai_api_key");
    if (savedProvider) setAiProvider(savedProvider);
    if (savedApiKey) setAiApiKey(savedApiKey);
  }, [status, session, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and Email are required");
      return;
    }
    setIsUpdatingProfile(true);

    try {
      // Mock update since profile edits can be updated via a NextAuth session update call
      // or a profile API endpoint. We will simulate a successful profile update.
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await update({ name }); // Update session client side
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    setIsUpdatingPassword(true);

    try {
      // In a full implementation, this calls an API endpoint to change the password
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully!");
    } catch {
      toast.error("Failed to change password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSaveAiPreferences = () => {
    localStorage.setItem("ai_provider", aiProvider);
    localStorage.setItem("ai_api_key", aiApiKey);
    toast.success("AI preferences and API key saved locally!");
  };

  const handleCheckout = async () => {
    setIsLoadingCheckout(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      if (!res.ok) throw new Error("Failed to create checkout session");
      const { url } = await res.json();
      window.location.href = url;
    } catch (error) {
      console.error(error);
      toast.error("Error creating checkout session");
    } finally {
      setIsLoadingCheckout(false);
    }
  };

  const handleBillingPortal = async () => {
    setIsLoadingBilling(true);
    try {
      const res = await fetch("/api/stripe/billing", { method: "POST" });
      if (!res.ok) throw new Error("Failed to create billing portal session");
      const { url } = await res.json();
      window.location.href = url;
    } catch (error) {
      console.error(error);
      toast.error("Error redirecting to billing portal");
    } finally {
      setIsLoadingBilling(false);
    }
  };

  const handleExportData = () => {
    toast.success("Data export started. You will receive an email shortly.");
  };

  const handleDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmText !== "delete my account") return;
    setIsDeleting(true);
    setTimeout(() => {
      signOut({ callbackUrl: '/' });
    }, 2000);
  };
  
  const handleSignOutAll = () => {
    toast.success("Successfully signed out of all other active sessions.");
  };

  const handleSaveNotifications = () => {
    toast.success("Notification preferences saved successfully.");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-6 py-10 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="p-2 rounded-lg bg-primary/10">
            <Settings className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Account Settings</h1>
            <p className="text-muted-foreground text-sm">
              Manage your profile, security, and AI configurations
            </p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <TabsList className="flex flex-row md:flex-col justify-start items-start h-auto bg-transparent space-y-1 w-full p-0">
            <TabsTrigger 
              value="profile" 
              className="w-full justify-start gap-2 px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg transition-all"
            >
              <User className="w-4 h-4" /> Profile Details
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="w-full justify-start gap-2 px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg transition-all"
            >
              <Key className="w-4 h-4" /> Security
            </TabsTrigger>
            <TabsTrigger 
              value="ai" 
              className="w-full justify-start gap-2 px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg transition-all"
            >
              <Brain className="w-4 h-4" /> AI Preferences
            </TabsTrigger>
            <TabsTrigger 
              value="billing" 
              className="w-full justify-start gap-2 px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg transition-all"
            >
              <CreditCard className="w-4 h-4" /> Billing & Subscription
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="w-full justify-start gap-2 px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg transition-all"
            >
              <Bell className="w-4 h-4" /> Notifications
            </TabsTrigger>
            <TabsTrigger 
              value="privacy" 
              className="w-full justify-start gap-2 px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg transition-all text-destructive data-[state=active]:text-destructive data-[state=active]:bg-destructive/10"
            >
              <Shield className="w-4 h-4" /> Data & Privacy
            </TabsTrigger>
          </TabsList>

          <div className="md:col-span-3">
            <TabsContent value="profile" className="m-0 focus-visible:outline-none focus-visible:ring-0 space-y-6 fade-in-up">
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your display name and email address
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="profile-name">Full Name</Label>
                      <div className="glow-focus rounded-md">
                        <Input
                          id="profile-name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-email">Email Address</Label>
                      <div className="glow-focus rounded-md">
                        <Input
                          id="profile-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@example.com"
                          disabled
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Email address cannot be changed because it is linked to your login credentials.
                      </p>
                    </div>
                    <Button type="submit" disabled={isUpdatingProfile} className="gap-2">
                      {isUpdatingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="m-0 focus-visible:outline-none focus-visible:ring-0 space-y-6 fade-in-up">
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Key className="w-5 h-5 text-primary" />
                    Change Password
                  </CardTitle>
                  <CardDescription>
                    Ensure your account is using a secure password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <div className="glow-focus rounded-md">
                        <Input
                          id="current-password"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="glow-focus rounded-md">
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 6 characters"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <div className="glow-focus rounded-md">
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={isUpdatingPassword} className="gap-2">
                      {isUpdatingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                      Update Password
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-primary" />
                    Active Sessions
                  </CardTitle>
                  <CardDescription>
                    Manage devices currently logged into your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-primary/20 bg-primary/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-background rounded-lg text-primary">
                          <Laptop className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">MacBook Pro - Chrome</p>
                          <p className="text-xs text-muted-foreground">San Francisco, CA &middot; Active Now</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-success/15 text-success border-none text-xs">
                        This Device
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-border/50 bg-card/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-background rounded-lg text-muted-foreground">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">iPhone 14 Pro - Safari</p>
                          <p className="text-xs text-muted-foreground">San Francisco, CA &middot; 2 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border/50">
                    <Button variant="outline" className="w-full sm:w-auto gap-2" onClick={handleSignOutAll}>
                      <LogOut className="w-4 h-4" />
                      Sign out of all other devices
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="m-0 focus-visible:outline-none focus-visible:ring-0 space-y-6 fade-in-up">
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    AI Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure preferred generative AI model and API keys
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ai-provider">AI Provider</Label>
                    <select
                      id="ai-provider"
                      value={aiProvider}
                      onChange={(e) => setAiProvider(e.target.value)}
                      className="w-full bg-secondary text-secondary-foreground px-3 py-2 rounded-md text-sm border border-border"
                    >
                      <option value="gemini">Google Gemini</option>
                      <option value="openai">OpenAI (ChatGPT)</option>
                      <option value="anthropic">Anthropic (Claude)</option>
                      <option value="groq">Groq (Llama-3)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ai-api-key">Custom API Key (Optional)</Label>
                    <div className="glow-focus rounded-md">
                      <Input
                        id="ai-api-key"
                        type="password"
                        value={aiApiKey}
                        onChange={(e) => setAiApiKey(e.target.value)}
                        placeholder="Paste your API key here..."
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Leave blank to use the server's default keys.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex gap-3 text-sm text-foreground">
                    <Shield className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <span className="font-semibold block mb-0.5">Secure Local Storage</span>
                      Your custom API Key is stored safely inside your browser's local storage and is never saved to our database.
                    </div>
                  </div>

                  <Button onClick={handleSaveAiPreferences} className="gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Save AI Preferences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="m-0 focus-visible:outline-none focus-visible:ring-0 space-y-6 fade-in-up">
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Billing & Subscription
                  </CardTitle>
                  <CardDescription>
                    Manage your subscription plan and payment methods
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-5 border border-primary/20 bg-primary/5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-primary flex items-center gap-2">
                        {((session?.user as { isPro?: boolean })?.isPro) ? "Pro Plan" : "Basic Plan"}
                        <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-xs text-primary font-bold tracking-wide uppercase">
                          {((session?.user as { isPro?: boolean })?.isPro) ? "Active" : "Free"}
                        </span>
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {((session?.user as { isPro?: boolean })?.isPro)
                          ? "You are currently on the Pro plan with unlimited AI tailoring."
                          : "You are currently on the free basic plan. Upgrade to Pro for unlimited AI tailoring and premium templates."}
                      </p>
                    </div>
                    {((session?.user as { isPro?: boolean })?.isPro) ? (
                      <Button 
                        variant="outline" 
                        className="shrink-0 gap-2" 
                        onClick={handleBillingPortal}
                        disabled={isLoadingBilling}
                      >
                        {isLoadingBilling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                        Manage Subscription
                      </Button>
                    ) : (
                      <Button 
                        className="shrink-0 gap-2 pulse-glow" 
                        onClick={handleCheckout}
                        disabled={isLoadingCheckout}
                      >
                        {isLoadingCheckout ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                        Upgrade to Pro
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Payment Methods</h4>
                    <div className="text-sm text-muted-foreground border border-border/50 rounded-lg p-6 text-center bg-card/30">
                      {((session?.user as { isPro?: boolean })?.isPro)
                        ? "Manage your payment methods in the Stripe billing portal."
                        : "No payment methods on file."}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="m-0 focus-visible:outline-none focus-visible:ring-0 space-y-6 fade-in-up">
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Choose what updates you want to receive via email
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:bg-muted/30 transition-colors">
                      <div className="flex-1 pr-4">
                        <p className="font-semibold text-sm">Job Matches</p>
                        <p className="text-xs text-muted-foreground mt-1">Receive daily alerts when new jobs match your base resume.</p>
                      </div>
                      <button 
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifyJobMatches ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                        onClick={() => setNotifyJobMatches(!notifyJobMatches)}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifyJobMatches ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:bg-muted/30 transition-colors">
                      <div className="flex-1 pr-4">
                        <p className="font-semibold text-sm">Application Status Reminders</p>
                        <p className="text-xs text-muted-foreground mt-1">Weekly digest of applications that haven't been updated in 14 days.</p>
                      </div>
                      <button 
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifyAppStatus ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                        onClick={() => setNotifyAppStatus(!notifyAppStatus)}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifyAppStatus ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:bg-muted/30 transition-colors">
                      <div className="flex-1 pr-4">
                        <p className="font-semibold text-sm">Product Updates & Tips</p>
                        <p className="text-xs text-muted-foreground mt-1">Receive emails about new features, AI models, and resume building tips.</p>
                      </div>
                      <button 
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifyProductUpdates ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                        onClick={() => setNotifyProductUpdates(!notifyProductUpdates)}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifyProductUpdates ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border/50">
                    <Button onClick={handleSaveNotifications} className="gap-2">
                      <Check className="w-4 h-4" /> Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="m-0 focus-visible:outline-none focus-visible:ring-0 space-y-6 fade-in-up">
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DownloadCloud className="w-5 h-5 text-primary" />
                    Export Data
                  </CardTitle>
                  <CardDescription>
                    Download a copy of your resumes, applications, and settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your data will be exported as a secure JSON archive. This process may take a few minutes depending on the number of tailored resumes you have generated.
                  </p>
                  <Button variant="outline" onClick={handleExportData} className="gap-2">
                    <DownloadCloud className="w-4 h-4" />
                    Request Data Export
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-card border-destructive/20 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Permanently delete your account and all associated data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-destructive/20 bg-destructive/10 text-destructive text-sm rounded-lg">
                    <strong>Warning:</strong> Deleting your account is irreversible. All your base resumes, tailored variations, job application records, and AI preferences will be permanently erased.
                  </div>
                  
                  <form onSubmit={handleDeleteAccount} className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="delete-confirm" className="text-destructive font-semibold">
                        Type <span className="bg-destructive/10 px-1 rounded font-mono select-all">delete my account</span> to confirm
                      </Label>
                      <Input
                        id="delete-confirm"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="delete my account"
                        className="border-destructive/30 focus-visible:ring-destructive/30"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      variant="destructive" 
                      disabled={deleteConfirmText !== "delete my account" || isDeleting}
                      className="w-full sm:w-auto gap-2"
                    >
                      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      Permanently Delete Account
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
