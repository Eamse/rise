import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export default function HelpCenterPage() {
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
            Help Center
          </h1>
          <p style={{ fontSize: "16px", lineHeight: 1.7, color: "#475569", marginBottom: "24px" }}>
            This is a basic page for FAQs and order/shipping/payment guidance.
          </p>

          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
            <p style={{ margin: "0 0 10px", color: "#334155" }}>- How to check order status</p>
            <p style={{ margin: "0 0 10px", color: "#334155" }}>- Shipping schedules and delay handling</p>
            <p style={{ margin: 0, color: "#334155" }}>- Payment errors and refund request steps</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
