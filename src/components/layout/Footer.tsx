import React from 'react';
import Link from 'next/link';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles['footer-container']}>
        <div className={styles['footer-top']}>
          <div className={styles['footer-column']}>
            <h4>Customer Service</h4>
            <ul>
              <li>
                <Link href="/help-center">Help Center</Link>
              </li>
              <li>
                <Link href="/inquiry">Contact</Link>
              </li>
              <li>
                <Link href="/policy">Policy</Link>
              </li>
              <li>
                <Link href="/notices">Notices</Link>
              </li>
              <li>
                <Link href="/returns">Returns</Link>
              </li>
            </ul>
          </div>
          <div className={styles['footer-column']}>
            <h4>Company</h4>
            <ul>
              <li>
                <Link href="/about">About RISE AUTOPARTS</Link>
              </li>
              <li>
                <Link href="/globe">Shipping Service</Link>
              </li>
              <li>
                <Link href="/brands">Our Brands</Link>
              </li>
            </ul>
          </div>
          <div className={styles['footer-bottom']}>
            <div className={styles['footer-socials']}>
              <Link
                href="https://www.facebook.com/riseautoparts.ph"
                aria-label="Facebook"
              >
                <FaFacebook />
              </Link>
              <Link
                href="https://www.instagram.com/riseautoparts?fbclid=IwY2xjawQmFFBleHRuA2FlbQIxMABicmlkETFsVjY3Rk1yZ1paRVk4ZmxKc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHlWOOROo4F5W3e37m0IUMLuPIJKjNbWJEvR4dcwuczTwgLEdhg9rVmmEmh-G_aem_x1aCzScl3mzHkzp4JwVEkA"
                aria-label="Instagram"
              >
                <FaInstagram />
              </Link>
            </div>
          </div>
        </div>
        <div className={styles['footer-copyright']}>
          &copy; {new Date().getFullYear()} RISE AUTOPARTS. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
