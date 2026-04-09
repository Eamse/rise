import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export default function PolicyPage() {
  return (
    <>
      <Header />
      <main
        style={{
          paddingTop: "240px",
          minHeight: "100vh",
          background: "#f8fafc",
          paddingBottom: "80px",
        }}
      >
        <section style={{ maxWidth: "960px", margin: "0 auto", padding: "0 20px" }}>
          <h1 style={{ fontSize: "32px", marginBottom: "12px", color: "#0f172a" }}>
            Policy
          </h1>
          <p style={{ fontSize: "16px", lineHeight: 1.7, color: "#475569", marginBottom: "24px" }}>
            This basic page explains service policies and operating guidelines.
          </p>

          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
            <h2 style={{ margin: "0 0 10px", fontSize: "20px" }}>Policy Examples</h2>
            <ul style={{ margin: 0, paddingLeft: "18px", color: "#334155", lineHeight: 1.8 }}>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Payment and Refund Policy</li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
