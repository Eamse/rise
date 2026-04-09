import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Link from "next/link";

export default function BrandsPage() {
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
            Brands
          </h1>
          <p style={{ fontSize: "16px", lineHeight: 1.7, color: "#475569", marginBottom: "24px" }}>
            This page introduces key brands available at Rise Autoparts.
            It is currently a starter page and can be expanded with brand logos, descriptions, and filters.
          </p>

          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
            <h2 style={{ fontSize: "20px", marginBottom: "10px" }}>Features Coming Soon</h2>
            <ul style={{ margin: 0, paddingLeft: "18px", color: "#334155", lineHeight: 1.8 }}>
              <li>Product lists by brand</li>
              <li>Brand search and filters</li>
              <li>Detailed brand profiles</li>
            </ul>
          </div>

          <div style={{ marginTop: "20px" }}>
            <Link href="/products" style={{ color: "#004ecc", fontWeight: 700 }}>
              Go to Products
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
