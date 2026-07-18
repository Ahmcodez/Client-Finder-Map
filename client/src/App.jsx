import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

const BusinessDetailsPage = lazy(() => import('./pages/BusinessDetailsPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const SavedLeadsPage = lazy(() => import('./pages/SavedLeadsPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));

function App() {
  return (
    <div className="min-h-screen bg-abyss text-white">
      <Navbar />
      <Suspense fallback={<div className="section-shell py-20 text-slate-400">Loading page...</div>}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <SavedLeadsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/business/:id"
            element={
              <ProtectedRoute>
                <BusinessDetailsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
