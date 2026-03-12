"use client";
import styles from "@/app/page.module.css";
import Image from "next/image";
import { useState } from "react";

const FEATURES = [
  {
    id: 1,
    icon: (
      <Image
        className={styles.featuresImg}
        src="/globe.png"
        alt="Globe"
        width={70}
        height={70}
      />
    ),
    title: "DIRECT FROM JAPAN",
    desc: "Source genuine parts",
    imageLabel: "PERFORMANCE BRAKING",
    hasImage: true,
    imgUrl: "/brakeDisk.png",
  },
  {
    id: 2,
    icon: (
      <Image
        className={styles.featuresImg}
        src="/authentic.png"
        alt="Authentic"
        width={60}
        height={60}
      />
    ),
    title: "100% AUTHENTIC",
    desc: "Guaranteed legitimacy",
    imageLabel: "",
    hasImage: false,
  },
  {
    id: 3,
    icon: (
      <Image
        className={styles.featuresImg}
        src="/factory.png"
        alt="Factory"
        width={60}
        height={60}
      />
    ),
    title: "FACTORY-DIRECT ORDER",
    desc: "Tailored to your needs",
    imageLabel: "FORGED ALLOY WHEELS",
    hasImage: true,
    imgUrl: "/wheel.jpeg",
  },
];

export default function FeatureCards() {
  const [activeId, setActiveId] = useState(2);

  return (
    <section className={styles.featuresSection}>
      {FEATURES.map((f) => {
        const isActive = f.id === activeId;

        return (
          <div
            key={f.id}
            className={`${styles.featureCard} ${isActive ? styles.featureCardActive : ""}`}
            onClick={() => setActiveId(f.id)}
          >
            <div className={styles.featureTop}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>

            <div className={styles.featureImageBox}>
              {f.hasImage ? (
                f.imgUrl ? (
                  <div className={styles.featureImageReal}>
                    <Image
                      src={f.imgUrl}
                      alt={f.imageLabel || "Feature image"}
                      fill
                      style={{ objectFit: "cover", borderRadius: "4px" }}
                    />
                  </div>
                ) : (
                  <div className={styles.featureImagePlaceholder} />
                )
              ) : (
                <div className={styles.featureImageEmpty} />
              )}
            </div>

            {f.imageLabel && (
              <p className={styles.featureImageLabel}>{f.imageLabel}</p>
            )}
          </div>
        );
      })}
    </section>
  );
}
