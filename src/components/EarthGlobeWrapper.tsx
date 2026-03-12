"use client";

import dynamic from "next/dynamic";

const DynamicEarthGlobe = dynamic(() => import("./EarthGlobe"), {
  ssr: false,
  loading: () => <div style={{ height: "600px", width: "100%" }} />,
});

export default function EarthGlobeWrapper() {
  return <DynamicEarthGlobe />;
}
