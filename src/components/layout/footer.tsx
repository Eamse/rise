import styles from "@/app/page.module.css";

export default function Footer() {
  return (
    <footer
      className={styles.footer || "footer"}
      style={{ textAlign: "center", padding: "2rem", color: "white" }}
    >
      <p>© 2024 Rise Autoparts Inc.</p>
    </footer>
  );
}
