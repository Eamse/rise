import Image from "next/image";
import styles from "./swiper.module.css";

type LogoItem = {
  id: number;
  src: string;
  alt: string;
};

export default function Swiper({ images }: { images: LogoItem[] }) {
  return (
    <div className={styles.window}>
      <div className={styles.train}>
        {images.map((logo) => (
          <div key={`original-${logo.id}`} className={styles.slide}>
            <Image
              src={logo.src}
              alt={logo.alt}
              width={110}
              height={50}
              style={{ objectFit: "contain" }}
            />
          </div>
        ))}

        {images.map((logo) => (
          <div key={`clone-${logo.id}`} className={styles.slide}>
            <Image
              src={logo.src}
              alt={logo.alt}
              width={110}
              height={50}
              style={{ objectFit: "contain" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
