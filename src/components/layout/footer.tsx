import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa6";
import styles from "./footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.column}>
            <h4>Customer Service</h4>
            <ul>
              <li>
                <Link href="#">Help Center</Link>
              </li>
              <li>
                <Link href="#">Dispute Resolution</Link>
              </li>
              <li>
                <Link href="#">Contact Seller</Link>
              </li>
              <li>
                <Link href="#">Policies & Rules</Link>
              </li>
            </ul>
          </div>
          <div className={styles.column}>
            <h4>About Us</h4>
            <ul>
              <li>
                <Link href="#">About RISE AUTOPARTS</Link>
              </li>
              <li>
                <Link href="#">Careers</Link>
              </li>
              <li>
                <Link href="#">Blog</Link>
              </li>
            </ul>
          </div>
          <div className={styles.column}>
            <h4>Selling</h4>
            <ul>
              <li>
                <Link href="#">Sell on RISE AUTOPARTS</Link>
              </li>
              <li>
                <Link href="#">Success Stories</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <div className={styles.copyright}>
            &copy; {new Date().getFullYear()} RISE AUTOPARTS. All rights
            reserved.
          </div>
          <div className={styles.socials}>
            <a href="#" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="#" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="#" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="#" aria-label="LinkedIn">
              <FaLinkedinIn />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
