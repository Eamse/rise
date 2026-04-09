import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export default function ManufacturersPage() {
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
            Manufacturers
          </h1>
          <p style={{ fontSize: "16px", lineHeight: 1.7, color: "#475569", marginBottom: "24px" }}>
            This is a basic page that introduces manufacturers.
            It can be expanded later with manufacturer profiles and related product links.
          </p>

          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
            <h2 style={{ margin: "0 0 10px", fontSize: "20px" }}>Coming Soon</h2>
            <ul style={{ margin: 0, paddingLeft: "18px", color: "#334155", lineHeight: 1.8 }}>
              <li>Manufacturer list and detailed profiles</li>
              <li>Key items by manufacturer</li>
              <li>Brand/manufacturer filter integration</li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
