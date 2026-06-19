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
import AddPayment from './pages/AddPayment';
import UploadProof from './pages/UploadProof';
import AddUpdate from './pages/AddUpdate';
import AdminComplaints from './pages/AdminComplaints';

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<Landing />} />
          <Route element={<MainLayout />}>
            <Route path="dashboard" element={<PublicDashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="add-project" element={<AddProject />} />
              <Route path="add-payment" element={<AddPayment />} />
              <Route path="upload-proof" element={<UploadProof />} />
              <Route path="add-update" element={<AddUpdate />} />
              <Route path="complaints" element={<AdminComplaints />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}
