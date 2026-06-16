import { Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from './layout/AppShell';
import { CollectionEditPage } from './pages/CollectionEditPage';
import { CollectionList } from './pages/CollectionList';
import { CollectionNewPage } from './pages/CollectionNewPage';
import { Dashboard } from './pages/Dashboard';
import { ImportPage } from './pages/ImportPage';
import { ItemDetail } from './pages/ItemDetail';
import { SettingsPage } from './pages/SettingsPage';
import { StatsPage } from './pages/StatsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="collections" element={<CollectionList />} />
        <Route path="collections/new" element={<CollectionNewPage />} />
        <Route path="collections/:id/edit" element={<CollectionEditPage />} />
        <Route path="collections/:id" element={<ItemDetail />} />
        <Route path="import" element={<ImportPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
