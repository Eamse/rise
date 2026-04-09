"use client";

import { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";
import { FaEarthAsia } from "react-icons/fa6";
import { HiOutlineWrenchScrewdriver } from "react-icons/hi2";
import { IoAirplane } from "react-icons/io5";
import { LuPackageCheck } from "react-icons/lu";
import { MdOutlineContentPasteSearch } from "react-icons/md";
import styles from "./EarthGlobe.module.css";

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
        newSize = width - 20; // mobile padding
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
  const N_KOR = { lat: 37.5668260046608, lng: 126.978652258309 };
  const N_CHI = { lat: 39.90683934719737, lng: 116.34178161621094 };
  const N_PH = { lat: 12.8797, lng: 121.774 };
  const N_US = { lat: 37.0902, lng: -95.7129 };
  const N_EU = { lat: 51.1657, lng: 10.4515 };
  const N_AU = { lat: -27.462966511788544, lng: 153.01886558532715 };

  const [hexData, setHexData] = useState({ features: [] });

  /* Process steps for the B2C storefront */
  const PROCESS_STEPS = [
    {
      num: 1,
      title: "Order Completed",
      describe: "Your premium auto parts order is confirmed instantly.",
      icon: <FaEarthAsia />,
    },
    {
      num: 2,
      title: "Quality Inspection",
      describe: "A global inspection center performs strict 100% checks.",
      icon: <MdOutlineContentPasteSearch />,
    },
    {
      num: 3,
      title: "Express Dispatch",
      describe: "Shipped quickly through an air logistics network.",
      icon: <HiOutlineWrenchScrewdriver />,
    },
    {
      num: 4,
      title: "Global Delivery",
      describe: "Delivered safely to your doorstep worldwide.",
      icon: <IoAirplane />,
    },
  ];

  useEffect(() => {
    // Load GeoJSON data to draw clear country polygons.
    fetch(
      "https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson",
    )
      .then((res) => res.json())
      .then((data) => setHexData(data));
  }, []);

  const ringsData = [
    {
      lat: N_JAPAN.lat,
      lng: N_JAPAN.lng,
      maxR: 6,
      propagationSpeed: 2,
      repeatPeriod: 1000,
      color: "#ff4d4f",
    },
    {
      lat: N_PH.lat,
      lng: N_PH.lng,
      maxR: 2,
      propagationSpeed: 1,
      repeatPeriod: 2000,
      color: "#87ceeb",
    },
    {
      lat: N_KOR.lat,
      lng: N_KOR.lng,
      maxR: 2,
      propagationSpeed: 1,
      repeatPeriod: 2000,
      color: "#87ceeb",
    },
    {
      lat: N_CHI.lat,
      lng: N_CHI.lng,
      maxR: 2,
      propagationSpeed: 1,
      repeatPeriod: 2000,
      color: "#87ceeb",
    },
    {
      lat: N_US.lat,
      lng: N_US.lng,
      maxR: 2,
      propagationSpeed: 1,
      repeatPeriod: 2000,
      color: "#87ceeb",
    },
    {
      lat: N_EU.lat,
      lng: N_EU.lng,
      maxR: 2,
      propagationSpeed: 1,
      repeatPeriod: 2000,
      color: "#87ceeb",
    },
    {
      lat: N_AU.lat,
      lng: N_AU.lng,
      maxR: 2,
      propagationSpeed: 1,
      repeatPeriod: 2000,
      color: "#87ceeb",
    },
  ];

  const arcsData = [
    {
      startLat: N_JAPAN.lat,
      startLng: N_JAPAN.lng,
      endLat: N_PH.lat,
      endLng: N_PH.lng,
      color: ["#4682b4", "#87ceeb"],
    },
    {
      startLat: N_JAPAN.lat,
      startLng: N_JAPAN.lng,
      endLat: N_US.lat,
      endLng: N_US.lng,
      color: ["#87ceeb", "#4682b4"],
    },
    {
      startLat: N_JAPAN.lat,
      startLng: N_JAPAN.lng,
      endLat: N_EU.lat,
      endLng: N_EU.lng,
      color: ["#87ceeb", "#ff4d4f"],
    },
    {
      startLat: N_JAPAN.lat,
      startLng: N_JAPAN.lng,
      endLat: N_AU.lat,
      endLng: N_AU.lng,
      color: ["#4682b4", "#ff4d4f"],
    },
    {
      startLat: N_JAPAN.lat,
      startLng: N_JAPAN.lng,
      endLat: N_KOR.lat,
      endLng: N_KOR.lng,
      color: ["#87ceeb", "#87ceeb"],
    },
    {
      startLat: N_JAPAN.lat,
      startLng: N_JAPAN.lng,
      endLat: N_CHI.lat,
      endLng: N_CHI.lng,
      color: ["#ff4d4f", "#ff4d4f"],
    },
  ];

  return (
    <div className={styles.globeLayout}>
      {/* ===== Fulfillment Flow ===== */}
      <section className={styles.processSection}>
        <div className={styles.processWrapper}>
          {PROCESS_STEPS.map((step, index) => (
            <div key={step.num} className={styles.processGroup}>
              <div
                className={
                  index === 0 ? styles.lineFadeInFirst : styles.lineConnect
                }
              />
              <div className={styles.dot} />
              <div className={styles.stepContent}>
                <div className={styles.icon}>{step.icon}</div>
                <div className={styles.textBlock}>
                  <span className={styles.stepLabel}>
                    Step {step.num}:<br />
                    <span className={styles.stepTitle}>{step.title}</span>
                  </span>
                  <span className={styles.stepDesc}>{step.describe}</span>
                </div>
              </div>
            </div>
          ))}

          <div className={styles.processGroup}>
            <div className={styles.lineConnect} />
            <div className={styles.dot} />
            <div className={styles.airplaneIcon}>
              <LuPackageCheck />
            </div>
          </div>
        </div>
      </section>

      <div className={styles.globeHeader}>
        <h2 className={styles.globeTitle}>Fast Delivery Connected Worldwide</h2>
        <p className={styles.globeSubtitle}>
          Wherever you are, we deliver premium auto parts quickly and safely
          to your door.
        </p>
      </div>

      <div className={styles.globeContainer}>
        {/* Subtle glow and platform shadow behind the globe */}
        <div className={styles.globeGlow} />
        <div className={styles.globePlatform} />

        <div className={styles.globeView}>
          <Globe
            ref={globeRef}
            width={globeSize}
            height={globeSize * 0.9}
            backgroundColor="rgba(0,0,0,0)"
            globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
            bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
            polygonsData={hexData.features}
            polygonCapColor={() => "rgba(70, 130, 180, 0.5)"}
            polygonSideColor={() => "rgba(0, 0, 0, 0)"}
            polygonStrokeColor={() => "rgba(135, 206, 235, 0.7)"}
            showAtmosphere={true}
            atmosphereColor="#87ceeb"
            atmosphereAltitude={0.15}
            arcsData={arcsData}
            arcColor={(d: object) => (d as { color: string | string[] }).color}
            arcDashLength={0.5}
            arcDashGap={0.2}
            arcDashAnimateTime={2500}
            arcAltitudeAutoScale={0.25}
            arcStroke={0.5}
            ringsData={ringsData}
            ringColor={(d: object) => (d as { color: string }).color}
            ringMaxRadius="maxR"
            ringPropagationSpeed="propagationSpeed"
            ringRepeatPeriod="repeatPeriod"
          />
        </div>
      </div>
      <div className={styles.globalStats}>
        <div className={styles.statBox}>
          <h4 className={styles.statTitle}>100% Safety Guaranteed</h4>
          <p className={styles.statDesc}>Custom export-grade packaging</p>
        </div>
        <div className={styles.statBox}>
          <h4 className={styles.statTitle}>Fast logistics system</h4>
          <p className={styles.statDesc}>Air cargo and direct ocean freight</p>
        </div>
        <div className={styles.statBox}>
          <h4 className={styles.statTitle}>Complete customs support</h4>
          <p className={styles.statDesc}>Full handling of complex customs tasks</p>
        </div>
      </div>
    </div>
  );
}
