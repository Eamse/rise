import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import PrivateAdminRoute from "./components/PrivateAdminRoute";
import Admin from "./pages/admin/Admin";
import AdminLogin from "./pages/admin/AdminLogin";
import ProductEdit from "./pages/admin/ProductEdit";
import ProductManage from "./pages/admin/ProductManage";
import ProductUpload from "./pages/admin/ProductUpload";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 로그인 페이지 (인증 불필요) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* 관리자 페이지 (토큰 없으면 로그인으로 튕김) */}
        <Route
          path="/admin"
          element={
            <PrivateAdminRoute>
              <Admin />
            </PrivateAdminRoute>
          }
        >
          <Route path="upload" element={<ProductUpload />} />
          <Route path="manage" element={<ProductManage />} />
          <Route path="edit/:id" element={<ProductEdit />} />
        </Route>

        {/* 그 외 경로는 로그인으로 */}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
