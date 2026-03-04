import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

function SignUp() {
  const [userInfo, setUserInfo] = useState({
    id: "",
    name: "",
    password: "",
    confirmPassword: "",
    email: "",
    company: "",
    phone: "",
  });
  const [error, setError] = useState({});
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userInfo.id,
        name: userInfo.name,
        password: userInfo.password,
        email: userInfo.email,
        company: userInfo.company,
        phone: userInfo.phone,
      }),
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      alert("회원가입이 완료 되었습니다.");
      navigate("/");
    } else {
      alert(data.message || "회원가입이 실패했습니다.");
    }
  };

  const validate = () => {
    let newError = {};
    if (userInfo.id.length < 4)
      newError.id = "아이디는 4자리 이상이여야 합니다.";
    if (!userInfo.email.includes("@"))
      newError.email = "이메일 형식이 올바르지 않습니다.";
    if (userInfo.password.length < 8)
      newError.password = "비밀번호는 8자리 이상이여야 합니다.";
    if (userInfo.password !== userInfo.confirmPassword)
      newError.confirmPassword = "비밀번호가 일치하지 않습니다.";

    setError(newError);
    return Object.keys(newError).length === 0;
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({
      ...userInfo,
      [name]: value,
    });
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h1>회원가입</h1>
        <p className="signup-subtitle">B2B 쇼핑몰 회원가입</p>
        <form className="signup-form" onSubmit={handleSubmit}>
          {/* 아이디 */}
          <div className="form-group">
            <label htmlFor="id">아이디 *</label>
            <input
              type="text"
              id="id"
              name="id"
              value={userInfo.id}
              onChange={handleChange}
              placeholder="example"
              required
            />
            {error.id && <p className="error-text">{error.id}</p>}
          </div>
          {/* 이름 */}
          <div className="form-group">
            <label htmlFor="name">이름 *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={userInfo.name}
              onChange={handleChange}
              placeholder="홍길동"
              required
            />
          </div>
          {/* 이메일 */}
          <div className="form-group">
            <label htmlFor="email">이메일 *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={userInfo.email}
              onChange={handleChange}
              placeholder="example@company.com"
              required
            />
            {error.email && <p className="error-text">{error.email}</p>}
          </div>

          {/* 비밀번호 */}
          <div className="form-group">
            <label htmlFor="password">비밀번호 *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={userInfo.password}
              onChange={handleChange}
              placeholder="8자 이상, 영문+숫자 포함"
              required
            />
            {error.password && <p className="error-text">{error.password}</p>}
          </div>

          {/* 비밀번호 확인 */}
          <div className="form-group">
            <label htmlFor="confirmPassword">비밀번호 확인 *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={userInfo.confirmPassword}
              onChange={handleChange}
              placeholder="비밀번호를 다시 입력하세요"
            />
            {error.confirmPassword && (
              <p className="error-text">{error.confirmPassword}</p>
            )}
          </div>

          {/* 회사명 */}
          <div className="form-group">
            <label htmlFor="company">회사명</label>
            <input
              type="text"
              id="company"
              name="company"
              value={userInfo.company}
              onChange={handleChange}
              placeholder="회사명"
              required
            />
          </div>

          {/* 전화번호 */}
          <div className="form-group">
            <label htmlFor="phone">전화번호</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={userInfo.phone}
              onChange={handleChange}
              placeholder="010-0000-0000"
              required
            />
          </div>

          {/* 회원가입 버튼 */}
          <button type="submit" className="signup-button">
            회원가입
          </button>

          {/* 로그인 페이지로 이동 */}
          <p className="login-link">
            이미 계정이 있으신가요? <a href="/login">로그인</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
