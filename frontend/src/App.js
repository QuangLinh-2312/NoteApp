import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppDialogProvider } from "./context/AppDialogContext";
import Login from "./components/Login";
import Register from "./components/Register";
import NotesApp from "./NotesApp";
import ErrorBoundary from "./components/ErrorBoundary";
import "./App.css";

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-gray-600 dark:text-gray-300">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return showRegister ? (
      <Register onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <Login onSwitchToRegister={() => setShowRegister(true)} />
    );
  }

  return <NotesApp />;
};

function App() {
  return (
    <ErrorBoundary>
      <AppDialogProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </AppDialogProvider>
    </ErrorBoundary>
  );
}

export default App;
