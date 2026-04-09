import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export default function InquiryPage() {
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
            Contact
          </h1>
          <p style={{ fontSize: "16px", lineHeight: 1.7, color: "#475569", marginBottom: "24px" }}>
            This is a basic contact page currently focused on contact channels.
          </p>

          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
            <p style={{ margin: "0 0 10px", color: "#334155" }}>
              Email: support@riseautoparts.com
            </p>
            <p style={{ margin: "0 0 10px", color: "#334155" }}>
              Business Hours: Weekdays 09:00 - 18:00
            </p>
            <p style={{ margin: 0, color: "#64748b" }}>
              A contact form and API integration can be added later.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
