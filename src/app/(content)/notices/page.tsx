import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

const notices = [
  {
    id: 1,
    title: "Service Maintenance Notice",
    date: "2026-04-04",
  },
  {
    id: 2,
    title: "Shipping Delay Notice",
    date: "2026-04-02",
  },
  {
    id: 3,
    title: "New Category Launch Notice",
    date: "2026-03-29",
  },
];

export default function NoticesPage() {
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
            Notices
          </h1>
          <p style={{ fontSize: "16px", lineHeight: 1.7, color: "#475569", marginBottom: "24px" }}>
            This is a basic list page for operational notices and updates.
          </p>

          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
            {notices.map((notice) => (
              <article
                key={notice.id}
                style={{
                  padding: "16px 20px",
                  borderBottom: notice.id !== notices.length ? "1px solid #f1f5f9" : "none",
                }}
              >
                <h2 style={{ margin: "0 0 6px", fontSize: "17px", color: "#1e293b" }}>
                  {notice.title}
                </h2>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>{notice.date}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
