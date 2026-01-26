import { Routes, Route, Navigate } from 'react-router-dom';
import { BusinessSignupPage } from './pages/BusinessSignupPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <a href="/" className="logo">
          <span className="logo-text">Home.Local</span>
        </a>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/business/signup" replace />} />
          <Route path="/business/signup" element={<BusinessSignupPage />} />
          <Route path="/business/confirmation" element={<ConfirmationPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Home.Local. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
