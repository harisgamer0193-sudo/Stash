import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AuthPage, Onboarding } from "@/components/Auth";
import { Dashboard } from "@/components/Dashboard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Toaster } from "sonner";

function AppContent() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AuthPage />;
  }

  if (profile && !profile.onboardingComplete) {
    return <Onboarding onComplete={() => window.location.reload()} />;
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="bottom-right" theme="dark" closeButton />
    </AuthProvider>
  );
}

