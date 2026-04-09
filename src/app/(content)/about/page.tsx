import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export default function AboutPage() {
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
            About Us
          </h1>
          <p style={{ fontSize: "16px", lineHeight: 1.7, color: "#475569", marginBottom: "24px" }}>
            Rise Autoparts is a B2C platform focused on reliable auto parts supply.
            This is a basic company profile page and can be extended with history, vision, and partners.
          </p>

          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
            <h2 style={{ fontSize: "20px", marginBottom: "10px" }}>Core Values</h2>
            <ul style={{ margin: 0, paddingLeft: "18px", color: "#334155", lineHeight: 1.8 }}>
              <li>Accurate parts information</li>
              <li>Reliable shipping and quality control</li>
              <li>Continuous customer support</li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
