import React from "react";
import "./Footer.css";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-column">
            <h4>고객 서비스</h4>
            <ul>
              <li>
                <a href="#">도움말 센터</a>
              </li>
              <li>
                <a href="#">분쟁 해결</a>
              </li>
              <li>
                <a href="#">판매자에게 문의</a>
              </li>
              <li>
                <a href="#">정책 및 규칙</a>
              </li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>회사 소개</h4>
            <ul>
              <li>
                <a href="#">RISE AUTOPARTS 소개</a>
              </li>
              <li>
                <a href="#">채용</a>
              </li>
              <li>
                <a href="#">블로그</a>
              </li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>판매하기</h4>
            <ul>
              <li>
                <a href="#">RISE AUTOPARTS에서 판매</a>
              </li>
              <li>
                <a href="#">성공 사례</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copyright">
            &copy; {new Date().getFullYear()} RISE AUTOPARTS. All rights
            reserved.
          </div>
          <div className="footer-socials">
            <a href="#" aria-label="Facebook">
              <FaFacebook />
            </a>
            <a href="#" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="#" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="#" aria-label="LinkedIn">
              <FaLinkedin />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
