import { Routes, Route, Navigate } from 'react-router-dom';

// Existing pages
import { BusinessSignupPage } from './pages/BusinessSignupPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { NotFoundPage } from './pages/NotFoundPage';

// OAuth flow pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ConsentPage } from './pages/ConsentPage';
import { LogoutPage } from './pages/LogoutPage';
import { PendingApprovalPage } from './pages/PendingApprovalPage';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <a href="/" className="logo">
          <span className="logo-text">Iriai</span>
        </a>
      </header>
      <main className="app-main">
        <Routes>
          {/* OAuth Flow Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/consent" element={<ConsentPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/pending-approval" element={<PendingApprovalPage />} />

          {/* Existing Business Registration Routes */}
          <Route path="/business/signup" element={<BusinessSignupPage />} />
          <Route
            path="/business/register"
            element={<Navigate to="/business/signup" replace />}
          />
          <Route path="/business/confirmation" element={<ConfirmationPage />} />

          {/* Default and fallback */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Iriai. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
