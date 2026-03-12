import EarthGlobeWrapper from "@/components/EarthGlobeWrapper";
import FeatureCards from "@/components/FeatureCards";
import Swiper from "@/components/swiper";
import Image from "next/image";
import Link from "next/link";
import { FaEarthAsia } from "react-icons/fa6";
import { HiOutlineWrenchScrewdriver } from "react-icons/hi2";
import { IoAirplane } from "react-icons/io5";
import { LuPackageCheck } from "react-icons/lu";
import { MdOutlineContentPasteSearch } from "react-icons/md";
import styles from "./page.module.css";
/* 유통 프로세스 스텝 데이터 (사진 100% 매칭 SVG 적용) */
const PROCESS_STEPS = [
  {
    num: 1,
    title: "Inquiry",
    describe: "Partner shares specific part numbers or target brands",
    icon: <FaEarthAsia />,
  },
  {
    num: 2,
    title: "Quotation",
    describe: "Provide a detailed proposal based on direct factory rates",
    icon: <MdOutlineContentPasteSearch />,
  },
  {
    num: 3,
    title: "Production",
    describe: "Manufacturing begins in Japan upon order confirmation",
    icon: <HiOutlineWrenchScrewdriver />,
  },
  {
    num: 4,
    title: "Global Shipping",
    describe: "Lead time of approx. 2–3 months for factory-to-door delivery",
    icon: <IoAirplane />,
  },
];

// 파트너 로고 이미지 리스트 (id, 이미지경로, 대체텍스트)
const PARTNER_LOGOS = [
  { id: 1, src: "/toyota_logo.png", alt: "TOYOTA" },
  { id: 2, src: "/nissan_logo.png", alt: "NISSAN" },
  { id: 3, src: "/honda_logo.png", alt: "HONDA" },
  { id: 4, src: "/mazda_logo.png", alt: "MAZDA" },
  { id: 5, src: "/subaru_logo.png", alt: "SUBARU" },
];

export default function Home() {
  return (
    <main>
      {/* ===== 히어로 섹션 ===== */}
      <div className={styles.heroSection}>
        <Image
          src="/main-bg.jpeg"
          alt="Rise Autoparts 메인 배경 이미지"
          fill
          priority
          quality={100}
          style={{ objectFit: "cover" }}
          className={styles.heroImage}
        />
        <div className={styles.overlay} />

        <div className={styles.content}>
          <h1 className={styles.title}>
            Uncompromising JDM
            <br />
            Directly Sourced
          </h1>
          <p className={styles.subtitle}>Direct from Japan to You</p>
          <a href="tel:010-6358-9413" className={styles.ctaButton}>
            CONTACT US
          </a>
        </div>

        <span className={styles.riseWatermark}>RISE</span>
      </div>

      {/* ===== 파트너 브랜드 로고 섹션 ===== */}
      <div className={styles.partners_container}>
        <div className={styles.partners_content}>
          <Link href="/partners" className={styles.partnersLink}>
            OUR PARTNERS
          </Link>
          <div className={styles.swiperWindow}>
            <Swiper images={PARTNER_LOGOS} />
          </div>
        </div>
      </div>

      <FeatureCards />

      {/* ===== 1. OUR EXPERTISE 섹션 ===== */}
      <section className={styles.expertiseSection}>
        <div className={styles.expertiseHeader}>
          <h2 className={styles.sectionTitle}>OUR EXPERTISE</h2>
          <p className={styles.sectionSubtitle}>
            Premium JDM Parts Direct to Your Garage
          </p>
        </div>
        <div className={styles.expertiseGrid}>
          {/* Card 1 */}
          <div className={styles.expertiseCard}>
            <div className={styles.expertiseImageWrapper}>
              <div className={styles.glowOverlay}></div>
            </div>
            <h3 className={styles.expertiseCardTitle}>PERFORMANCE ENGINE</h3>
          </div>
          {/* Card 2 */}
          <div className={styles.expertiseCard}>
            <div className={styles.expertiseImageWrapper}>
              <div className={styles.glowOverlay}></div>
            </div>
            <h3 className={styles.expertiseCardTitle}>FORGED WHEELS</h3>
          </div>
          {/* Card 3 */}
          <div className={styles.expertiseCard}>
            <div className={styles.expertiseImageWrapper}>
              <div className={styles.glowOverlay}></div>
            </div>
            <h3 className={styles.expertiseCardTitle}>AERO BODY KITS</h3>
          </div>
          {/* Card 4 */}
          <div className={styles.expertiseCard}>
            <div className={styles.expertiseImageWrapper}>
              <div className={styles.glowOverlay}></div>
            </div>
            <h3 className={styles.expertiseCardTitle}>SUSPENSION SYSTEMS</h3>
          </div>
        </div>
      </section>

      {/* ===== 유통 과정 (결과물 100% 매칭) ===== */}
      <section className={styles.processSection}>
        <div className={styles.processWrapper}>
          {/* 맨 앞 그라데이션 선 */}
          <div className={styles.lineFadeIn} />

          {PROCESS_STEPS.map((step) => (
            <div key={step.num} className={styles.processGroup}>
              {/* 빛나는 틸 색상 원 모양 점 */}
              <div className={styles.dot} />

              {/* 아이콘 + 텍스트 묶음 */}
              <div className={styles.stepContent}>
                <div className={styles.icon}>{step.icon}</div>
                <div className={styles.textBlock}>
                  <span className={styles.stepLabel}>Step {step.num}:</span>
                  <span className={styles.stepTitle}>{step.title}</span>
                  <span className={styles.stepDesc}>{step.describe}</span>
                </div>
              </div>

              {/* 스텝 사이 이어지는 틸 실선 */}
              <div className={styles.lineConnect} />
            </div>
          ))}

          {/* 맨 끝 부분: 점 + 비행기 */}
          <div className={styles.dot} />
          <div className={styles.airplaneIcon}>
            <LuPackageCheck />
          </div>
        </div>
      </section>

      {/* ===== 2. GLOBAL NETWORK & ASSURANCE (궁극의 신뢰 섹션) ===== */}
      <section className={styles.globalSection}>
        <div className={styles.globalContainer}>
          <div className={styles.globalHeader}>
            <h2 className={styles.sectionTitle}>GLOBAL ASSURANCE</h2>
            <p className={styles.sectionSubtitle}>
              Absolute Trust, Uncompromised Delivery
            </p>
          </div>

          <div className={styles.globalMapArea}>
            {/* 3D 지구본 + 네온 궤적 애니메이션 */}
            <EarthGlobeWrapper />

            {/* 신뢰도 제공 텍스트 상자 리스트 */}
            <div className={styles.globalStats}>
              <div className={styles.statBox}>
                <h4 className={styles.statTitle}>100% SECURE</h4>
                <p className={styles.statDesc}>Custom Export Crating</p>
              </div>
              <div className={styles.statBox}>
                <h4 className={styles.statTitle}>FAST LOGISTICS</h4>
                <p className={styles.statDesc}>
                  Air Freight & Direct Ocean Cargo
                </p>
              </div>
              <div className={styles.statBox}>
                <h4 className={styles.statTitle}>FULL CLEARANCE</h4>
                <p className={styles.statDesc}>Hassle-free Customs Support</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
