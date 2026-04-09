"use client";

import MainMiddleSection from "@/components/features/MainMiddleSection";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { CATEGORIES } from "@/constants/categoryData";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./Main.module.css";

const Home: React.FC = () => {
  const router = useRouter();

  return (
    <>
      <Header />
      <main className={styles.mainContents}>
        <div className={styles.mainContentWrapper}>
          <section className={styles.heroCategorySection}>
            <div className={styles.heroScrollHint}>
              Swipe sideways to browse categories <span>→</span>
            </div>
            <div className={styles.heroGrid}>
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.name}
                  className={styles.heroCard}
                  onClick={() =>
                    router.push(
                      `/products?category=${encodeURIComponent(cat.name)}`,
                    )
                  }
                >
                  <div className={styles.heroCardBg}>
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="33vw"
                      style={{ objectFit: "cover" }}
                      priority
                    />
                    <div className={styles.heroOverlay} />
                  </div>
                  <div className={styles.heroCardContent}>
                    <div className={styles.heroTextWrap}>
                      <h2 className={styles.heroCatName}>{cat.name}</h2>
                      <p className={styles.heroCatDesc}>
                        Premium {cat.name} Explore a wide lineup of products.
                      </p>
                      <div className={styles.heroCatBtn}>
                        Explore <span>→</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <MainMiddleSection />
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Home;
