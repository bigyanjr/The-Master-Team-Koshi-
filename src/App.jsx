import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleProtectedRoute from './components/auth/RoleProtectedRoute';
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
import CitizenQueryBot from './pages/CitizenQueryBot';
import ProjectQRBoard from './pages/ProjectQRBoard';
import ProjectMobileScan from './pages/ProjectMobileScan';
import QrDemo from './pages/QrDemo';
import Pitch from './pages/Pitch';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import DevReset from './pages/DevReset';

export default function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route index element={<Landing />} />
            <Route path="pitch" element={<Pitch />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="scan/:id" element={<ProjectMobileScan />} />
            <Route path="qr-demo/:id" element={<QrDemo />} />
            <Route path="dev-reset" element={<DevReset />} />
            <Route element={<MainLayout />}>
              <Route path="dashboard" element={<PublicDashboard />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="projects/:id/qr-board" element={<ProjectQRBoard />} />
              <Route path="complaints" element={<Complaints />} />
              <Route path="ask" element={<CitizenQueryBot />} />
              <Route path="profile" element={<ProtectedRoute />}>
                <Route index element={<Profile />} />
              </Route>
              <Route path="admin" element={<RoleProtectedRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="add-project" element={<AddProject />} />
                  <Route path="add-payment" element={<AddPayment />} />
                  <Route path="upload-proof" element={<UploadProof />} />
                  <Route path="add-update" element={<AddUpdate />} />
                  <Route path="complaints" element={<AdminComplaints />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </DataProvider>
  );
}
