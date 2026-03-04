import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";

import Cart from "./pages/user/Cart";
import Checkout from "./pages/user/Checkout";
import Login from "./pages/user/Login";
import Main from "./pages/user/Main";
import OrderComplete from "./pages/user/OrderComplete";
import ProductList from "./pages/user/ProductList";
import ProjectDetail from "./pages/user/ProjectDetail";
import SignUp from "./pages/user/Signup";

import "./App.css";

function UserLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* === 일반 유저 라우트 (헤더/푸터 있음) === */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Main />} />
          <Route path="Signup" element={<SignUp />} />
          <Route path="login" element={<Login />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/:id" element={<ProjectDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-complete" element={<OrderComplete />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
