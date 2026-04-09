export const ProductImage = "https://via.placeholder.com/200x200?text=Product";

// Vehicle parts categories
export const CATEGORIES = [
  { name: "WHEELS", image: "/forgedWheel.jpeg" },
  {
    name: "RACING SEATS",
    image: "/racing_seat.png",
  },
  {
    name: "PERFORMANCE",
    image: "/performance.jpeg",
  },
];

// Menu categories
export const SUBCATEGORIES: Record<string, { name: string; image: string }[]> =
  {
    WHEELS: [
      { name: "YOKOHAMA", image: "YOKOHAMA" },
      { name: "RAYS VOLK RACING", image: "RAYS_VOLK_RACING" },
      { name: "RAYS gramLIGHTS", image: "RAYS_gramLIGHTS" },
      { name: "RAYS HOMURA", image: "RAYS_HOMURA" },
      { name: "WEDS SPORTS", image: "WEDS_SPORTS" },
      { name: "WEDS 3P", image: "WEDS_3P" },
      { name: "BBS", image: "BBS" },
      { name: "ENKEI", image: "ENKEI" },
      { name: "TWS", image: "TWS" },
      { name: "WORK", image: "WORK" },
      { name: "SSR", image: "SSR" },
      { name: "MONJA JAPAN", image: "MONJA_JAPAN" },
      { name: "WATANABE", image: "WATANABE" },
      { name: "NEEZ", image: "NEEZ" },
      { name: "Wheel nuts parts", image: "WheelNutsParts" },
    ],
    "RACING SEATS": [
      { name: "RECARO", image: "RECARO" },
      { name: "BRIDE", image: "BRIDE" },
    ],
    PERFORMANCE: [
      { name: "HKS plug", image: "HKS_plug" },
      { name: "Engine", image: "Engine" },
      { name: "Drivetrain", image: "Drivetrain" },
      { name: "Gauge", image: "Gauge" },
      { name: "Cooling System", image: "CoolingSystem" },
      { name: "Steering wheel", image: "SteeringWheel" },
      { name: "Brake", image: "Brake" },
      { name: "Accessories", image: "Accessories" },
    ],
    DEFAULT: [],
  };
