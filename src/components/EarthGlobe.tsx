"use client";

import { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";

export default function EarthGlobe() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const [globeSize, setGlobeSize] = useState(800);

  useEffect(() => {
    const handleResize = () => {
      // Find the parent container's width or fallback to window width
      const width = window.innerWidth;
      let newSize = 800; // default for desktop
      if (width < 768) {
        newSize = width - 20; // mobile padding (더 꽉 차게)
      } else if (width < 1200) {
        newSize = 650; // tablet
      }
      setGlobeSize(newSize);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      // Auto-rotate the globe slowly rightward
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
      globeRef.current.controls().enableZoom = false; // Disable zoom to prevent scroll trapping

      // Orient the globe focusing on Asia/Pacific initially
      globeRef.current.pointOfView({ lat: 20, lng: 130, altitude: 2 }, 0);
    }
  }, []);

  // Coordinates
  const N_JAPAN = { lat: 36.2048, lng: 138.2529 };
  const N_PH = { lat: 12.8797, lng: 121.774 };
  const N_US = { lat: 37.0902, lng: -95.7129 };
  const N_EU = { lat: 51.1657, lng: 10.4515 };
  const N_ME = { lat: 23.4241, lng: 53.8478 }; // UAE
  const N_AU = { lat: -25.2744, lng: 133.7751 }; // Australia

  // Custom glowing rings mapping! (Cyberpunk beacon pulse)
  const ringsData = [
    {
      lat: N_JAPAN.lat,
      lng: N_JAPAN.lng,
      maxR: 6,
      propagationSpeed: 2,
      repeatPeriod: 1000,
      color: "#00ffea",
    }, // Japan Base
    {
      lat: N_PH.lat,
      lng: N_PH.lng,
      maxR: 2,
      propagationSpeed: 1,
      repeatPeriod: 2000,
      color: "#ffffff",
    }, // Philippines Terminal!
  ];

  // Point connections outwards from Japan
  const arcsData = [
    // 일본 -> 필리핀 비행선 궤적!
    {
      startLat: N_JAPAN.lat,
      startLng: N_JAPAN.lng,
      endLat: N_PH.lat,
      endLng: N_PH.lng,
      color: ["#00ffea", "#ffffff"],
    },

    // 글로벌 브랜드를 위한 타대륙 궤적
    {
      startLat: N_JAPAN.lat,
      startLng: N_JAPAN.lng,
      endLat: N_US.lat,
      endLng: N_US.lng,
      color: ["#00ffea", "#00d4b8"],
    },
    {
      startLat: N_JAPAN.lat,
      startLng: N_JAPAN.lng,
      endLat: N_EU.lat,
      endLng: N_EU.lng,
      color: ["#00d4b8", "#ffffff"],
    },
    {
      startLat: N_JAPAN.lat,
      startLng: N_JAPAN.lng,
      endLat: N_ME.lat,
      endLng: N_ME.lng,
      color: ["#00ffea", "#00ffea"],
    },
    {
      startLat: N_JAPAN.lat,
      startLng: N_JAPAN.lng,
      endLat: N_AU.lat,
      endLng: N_AU.lng,
      color: ["#ffffff", "#00ffea"],
    },
  ];

  return (
    <div
      className="globe-container"
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "grab",
        zIndex: 5,
        paddingBottom: "50px",
        marginTop: "-40px", // 지구본 위치 살짝 끌어올림
      }}
    >
      <Globe
        ref={globeRef}
        width={globeSize}
        height={globeSize * 0.9} // 약간 와이드하게
        backgroundColor="rgba(0,0,0,0)" // 투명 배경
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        // 날아가는 궤적 (Arcs)
        arcsData={arcsData}
        arcColor={(d: object) => (d as { color: string | string[] }).color}
        arcDashLength={0.5}
        arcDashGap={0.2}
        arcDashAnimateTime={2500}
        arcAltitudeAutoScale={0.25}
        arcStroke={0.5}
        // 지상 레이더 펄스 (Rings)
        ringsData={ringsData}
        ringColor={(d: object) => (d as { color: string }).color}
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
      />
    </div>
  );
}
