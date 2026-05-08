import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from './services/auth';

// Layout & Auth
import { AdminLayout } from './views/AdminLayout';
import { Login } from './views/Login';

// Mocks
import { UsersView } from './views/UsersView';
import { PlansView } from './views/PlansView';
import { LevelsView } from './views/LevelsView';
import { ObjectsView } from './views/ObjectsView';
import { ChallengesView } from './views/ChallengesView';
import { SubscriptionsView } from './views/SubscriptionsView';
import { SessionsView } from './views/SessionsView';
import { PacksView } from './views/PacksView';
import { PlayerSettingsView } from './views/PlayerSettingsView';

const PrivateRoute = () => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    setIsAuth(authService.isAuthenticated());
  }, [location]);

  if (isAuth === null) return null; // O un spinner de carga

  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Navigate to="/users" replace />} />
            <Route path="users" element={<UsersView />} />
            <Route path="plans" element={<PlansView />} />
            <Route path="levels" element={<LevelsView />} />
            <Route path="objects" element={<ObjectsView />} />
            <Route path="challenges" element={<ChallengesView />} />
            <Route path="packs" element={<PacksView />} />
            <Route path="player-settings" element={<PlayerSettingsView />} />
            <Route path="subscriptions" element={<SubscriptionsView />} />
            <Route path="sessions" element={<SessionsView />} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
