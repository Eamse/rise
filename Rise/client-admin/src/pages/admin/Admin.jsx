import { Link, NavLink, Outlet } from "react-router-dom";
import "./Admin.css";

function Admin() {
  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>RISE AUTOPARTS</h2>
          <span className="admin-badge">Admin 센터</span>
        </div>

        <nav className="admin-nav">
          <ul className="admin-nav-list">
            <li>
              <NavLink to="/admin" end className="admin-nav-item">
                대시보드
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/upload" className="admin-nav-item">
                상품 등록
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/manage" className="admin-nav-item">
                상품 관리
              </NavLink>
            </li>
            <li className="nav-bottom">
              <Link to="/" className="admin-nav-item back-to-shop">
                쇼핑몰로 돌아가기
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-title">관리자 대시보드</div>
          <div className="topbar-user">관리자님 환영합니다</div>
        </header>
        <div className="admin-content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Admin;
