import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { Home, Login, Register, VerifyOtp, Consultancies, ConsultancyDetail, CountryExplorer, StudyInfo, ReportScam, Reviews } from './routes/pages';
import { AdminPortal, ConsultancyManagement, StudentPortal } from './features/portals';
import { useAuthStore } from './store/authStore';
function Protected({ children, admin = false }) { const user = useAuthStore(s => s.user); const location = useLocation(); if (!user)
    return <Navigate to="/login" state={{ from: location.pathname }} replace/>; if (admin && user.role !== 'admin')
    return <Navigate to="/dashboard" replace/>; return children; }
export default function App() { return <Routes><Route element={<AppLayout />}><Route path="/" element={<Home />}/><Route path="/login" element={<Login />}/><Route path="/register" element={<Register />}/><Route path="/verify-otp" element={<VerifyOtp />}/><Route path="/dashboard" element={<Protected><StudentPortal /></Protected>}/><Route path="/consultancies" element={<Consultancies />}/><Route path="/consultancies/:id" element={<ConsultancyDetail />}/><Route path="/countries" element={<CountryExplorer />}/><Route path="/study/:type" element={<StudyInfo />}/><Route path="/reports/new" element={<Protected><ReportScam /></Protected>}/><Route path="/reviews" element={<Reviews />}/><Route path="/admin" element={<Protected admin><AdminPortal /></Protected>}/><Route path="/admin/consultancies" element={<Protected admin><ConsultancyManagement /></Protected>}/></Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes>; }
