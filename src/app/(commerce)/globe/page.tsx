"use client";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import dynamic from "next/dynamic";

const EarthGlobe = dynamic(
  () => import("@/components/common/globe/EarthGlobe"),
  { ssr: false },
);

export default function GlobePage() {
  return (
    <>
      <Header />
      <div
        style={{
          paddingTop: "240px",
          backgroundColor: "#f8f9fa",
          minHeight: "100vh",
        }}
      >
        <div style={{ width: "100%", margin: "0 auto", padding: "40px 0" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h1
              style={{ fontSize: "32px", fontWeight: "bold", color: "#1a233a" }}
            >
              Global B2C Network
            </h1>
            <p style={{ fontSize: "16px", color: "#666", marginTop: "12px" }}>
              With trusted partners around the world, RISE AUTOPARTS supplies reliable parts.
            </p>
          </div>
          <div
            style={{
              background:
                "radial-gradient(circle at 50% 40%, #10233f 0%, #0b0f19 55%, #070a12 100%)",
              width: "100%",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <EarthGlobe />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
