import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export default function ReturnsPage() {
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
            Returns
          </h1>
          <p style={{ fontSize: "16px", lineHeight: 1.7, color: "#475569", marginBottom: "24px" }}>
            This page explains return request steps and conditions.
          </p>

          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
            <ol style={{ margin: 0, paddingLeft: "18px", color: "#334155", lineHeight: 1.8 }}>
              <li>Check your order number and reason for return.</li>
              <li>Submit your return request through customer support.</li>
              <li>After inspection, a refund or exchange is processed.</li>
            </ol>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
