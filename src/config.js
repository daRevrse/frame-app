// Configuration de l'application

const isDevelopment = import.meta.env.MODE === "development";

export const config = {
  // URLs
  FRONTEND_URL: isDevelopment
    ? "http://localhost:5173"
    : "https://app.myframe.flowkraftagency.com",

  API_URL: isDevelopment
    ? "http://localhost:3001"
    : "https://api.myframe.flowkraftagency.com",

  // Stripe (utilisez vos vraies clés en production)
  STRIPE_PUBLIC_KEY: isDevelopment
    ? import.meta.env.VITE_STRIPE_PUBLIC_KEY_TEST
    : import.meta.env.VITE_STRIPE_PUBLIC_KEY_LIVE,

  // Plans tarifaires (durée en heures)
  PLANS: {
    FREE: {
      id: "free",
      name: "Gratuit",
      duration: 1, // 1 heure
      price: 0,
      priceId: null,
      description: "Essai gratuit pendant 1 heure",
      popular: false,
    },
    HOUR_24: {
      id: "24h",
      name: "24 Heures",
      duration: 24,
      price: 2.99,
      priceId: "price_1SYDvH05Xn1CE243xxqttp87",
      description: "Parfait pour un événement",
      popular: false,
    },
    WEEK: {
      id: "7days",
      name: "7 Jours",
      duration: 168, // 7 * 24
      price: 9.99,
      priceId: "price_1SYDw105Xn1CE243gKqE70Q7",
      description: "Le plus populaire",
      popular: true,
    },
    MONTH: {
      id: "1month",
      name: "1 Mois",
      duration: 720, // 30 * 24
      price: 19.99,
      priceId: "price_1SYDwd05Xn1CE243ZR8kblQ3",
      description: "Pour une campagne",
      popular: false,
    },
    MONTH_6: {
      id: "6months",
      name: "6 Mois",
      duration: 4320, // 180 * 24
      price: 49.99,
      priceId: "price_1SYDxg05Xn1CE243OY8ETKrK",
      description: "Économisez 58%",
      popular: false,
    },
    YEAR: {
      id: "1year",
      name: "1 An",
      duration: 8760, // 365 * 24
      price: 79.99,
      priceId: "price_1SYDy605Xn1CE243e2xKwSyJ",
      description: "Meilleure valeur",
      popular: false,
    },
  },
};

export default config;
