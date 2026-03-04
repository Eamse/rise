// PrivateAdminRoute.jsx - 관리자 토큰 없으면 로그인 페이지로 쫓아냄
import { Navigate } from "react-router-dom";

function PrivateAdminRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

export default PrivateAdminRoute;
