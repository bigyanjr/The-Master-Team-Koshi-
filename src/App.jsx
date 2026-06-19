import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import Landing from './pages/Landing';
import PublicDashboard from './pages/PublicDashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Complaints from './pages/Complaints';
import AdminDashboard from './pages/AdminDashboard';
import AddProject from './pages/AddProject';
import AddUpdate from './pages/AddUpdate';

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<Landing />} />
            <Route path="dashboard" element={<PublicDashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="add-project" element={<AddProject />} />
              <Route path="add-update" element={<AddUpdate />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}
