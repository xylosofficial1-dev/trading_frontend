import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import Notifications from "../pages/Notifications";
import PayOptions from "../pages/PayOptions";
import WalletSettings from "../pages/WalletRequests";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import TradeWalletRequest from "../pages/TradeWalletRequest";
import Videos from "../pages/Videos";
import Markets from "../pages/Markets";
import P2PAdmin from "../pages/P2p";
import SwapHistory from "../pages/SwapHistory";
import TaskSalaryHistory from "../pages/TaskSalaryHistory";


export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="payoptions" element={<PayOptions />} />
          <Route path="wallet-request" element={<WalletSettings />} />
          <Route path="/trade-wallet-request" element={<TradeWalletRequest />} />
<Route path="/videos" element={<Videos />} />
<Route path="/markets" element={<Markets />} />
<Route path="p2p" element={<P2PAdmin />} />
<Route path="/swap-history" element={<SwapHistory />} />
<Route path="/task-salary-history" element={<TaskSalaryHistory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
