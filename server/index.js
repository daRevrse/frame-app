import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import crypto from "crypto";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration Stripe
const isDevelopment = process.env.NODE_ENV !== "production";
const stripeKey = isDevelopment
  ? process.env.STRIPE_SECRET_KEY_TEST
  : process.env.STRIPE_SECRET_KEY_LIVE;

const stripe = stripeKey ? new Stripe(stripeKey) : null;

// URLs configurables
const FRONTEND_URL = process.env.FRONTEND_URL;
const API_URL = process.env.API_URL;

// --- CONFIGURATION FICHIERS ET BDD ---

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Base de données (JSON)
const dbPath = path.join(__dirname, "frames.json");
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ frames: [] }));
}

const readDB = () => {
  try {
    return JSON.parse(fs.readFileSync(dbPath, "utf8"));
  } catch (e) {
    return { frames: [] };
  }
};

const writeDB = (data) =>
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

// Helper: Calculer la date d'expiration
const calculateExpirationDate = (planId) => {
  const durations = {
    free: 1, // 1 heure
    "24h": 24,
    "7days": 168,
    "1month": 720,
    "6months": 4320,
    "1year": 8760,
  };
  const hours = durations[planId] || 1;
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + hours);
  return expiration.toISOString();
};

// Helper: Vérifier si un cadre est expiré
const isFrameExpired = (frame) => {
  if (!frame.expiresAt) return false;
  return new Date(frame.expiresAt) < new Date();
};

// --- MIDDLEWARE ET WEBHOOK ---

app.use(cors());

// IMPORTANT : Le Webhook Stripe doit être défini AVANT les parsers globaux (json/urlencoded)
// car il a besoin du corps brut (raw body) pour la validation de signature.
app.post(
  "/api/webhook/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    if (!stripe) {
      return res.status(500).send("Stripe not configured");
    }

    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Gérer l'événement de paiement réussi
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { frameId, planId } = session.metadata;

      // Mettre à jour le cadre avec le nouveau plan
      const db = readDB();
      const frameIndex = db.frames.findIndex((f) => f.id === frameId);

      if (frameIndex !== -1) {
        const newExpiresAt = calculateExpirationDate(planId);
        db.frames[frameIndex].plan = planId;
        db.frames[frameIndex].expiresAt = newExpiresAt;
        db.frames[frameIndex].paidAt = new Date().toISOString();
        writeDB(db);

        console.log(`✅ Cadre ${frameId} mis à jour avec le plan ${planId}`);
      }
    }

    res.json({ received: true });
  }
);

// Parsers globaux pour le reste de l'API
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Servir les fichiers statiques avec CORS
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET");
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(uploadsDir)
);

// Configuration Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueId = crypto.randomBytes(16).toString("hex");
    const ext = path.extname(file.originalname);
    cb(null, `frame-${uniqueId}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite Multer à 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error("Seules les images sont autorisées"));
  },
});

// Tâche planifiée : Nettoyage des fichiers expirés (toutes les heures)
const cleanupExpiredFiles = () => {
  try {
    const db = readDB();
    const now = new Date();
    let changed = false;

    db.frames = db.frames.filter((frame) => {
      // Si expiré
      if (frame.expiresAt && new Date(frame.expiresAt) < now) {
        const filePath = path.join(uploadsDir, frame.filename);
        // Supprimer le fichier physique
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
            console.log(`🗑️ Fichier supprimé : ${frame.filename}`);
          } catch (err) {
            console.error(`Erreur suppression ${frame.filename}:`, err);
          }
        }
        changed = true;
        return false; // Retirer de la liste
      }
      return true; // Garder
    });

    if (changed) writeDB(db);
  } catch (error) {
    console.error("Erreur lors du nettoyage automatique:", error);
  }
};

// Lancer le nettoyage toutes les 60 minutes
setInterval(cleanupExpiredFiles, 60 * 60 * 1000);
// Lancer un nettoyage au démarrage
cleanupExpiredFiles();

// --- ROUTES API ---

// Upload un nouveau cadre
app.post("/api/frames/upload", upload.single("frame"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier uploadé" });
    }

    const frameId = crypto.randomBytes(8).toString("hex");
    const expiresAt = calculateExpirationDate("free");

    const frameData = {
      id: frameId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/${req.file.filename}`,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date().toISOString(),
      expiresAt: expiresAt,
      plan: "free",
    };

    const db = readDB();
    db.frames.push(frameData);
    writeDB(db);

    res.json({
      success: true,
      frameId: frameId,
      frameUrl: `${API_URL}${frameData.path}`,
      shareUrl: `${FRONTEND_URL}/?frame=${frameId}`,
      expiresAt: expiresAt,
    });
  } catch (error) {
    console.error("Erreur lors de l'upload:", error);
    res.status(500).json({ error: "Erreur lors de l'upload du cadre" });
  }
});

// Récupérer un cadre par ID
app.get("/api/frames/:id", (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();
    const frame = db.frames.find((f) => f.id === id);

    if (!frame) {
      return res.status(404).json({ error: "Cadre non trouvé" });
    }

    // Vérifier l'expiration
    if (isFrameExpired(frame)) {
      return res.status(410).json({
        error: "Cadre expiré",
        expired: true,
        frameId: frame.id,
      });
    }

    res.json({
      success: true,
      frame: {
        id: frame.id,
        url: `${API_URL}${frame.path}`,
        originalName: frame.originalName,
        uploadedAt: frame.uploadedAt,
        expiresAt: frame.expiresAt,
        plan: frame.plan || "free",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération:", error);
    res.status(500).json({ error: "Erreur lors de la récupération du cadre" });
  }
});

// Tous les cadres (actifs)
app.get("/api/frames", (req, res) => {
  try {
    const db = readDB();
    const frames = db.frames
      .filter((frame) => !isFrameExpired(frame))
      .map((frame) => ({
        id: frame.id,
        url: `${API_URL}${frame.path}`,
        originalName: frame.originalName,
        uploadedAt: frame.uploadedAt,
        expiresAt: frame.expiresAt,
        plan: frame.plan,
      }));

    res.json({ success: true, frames });
  } catch (error) {
    console.error("Erreur:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des cadres" });
  }
});

// Créer une session Stripe Checkout
app.post("/api/checkout/create-session", async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe n'est pas configuré" });
    }

    const { priceId, frameId, planId } = req.body;

    if (!priceId || !frameId) {
      return res.status(200).json({
        error: "Paramètres requis manquants",
        details: {
          priceId: !priceId ? "priceId est requis" : "OK",
          frameId: !frameId ? "frameId est requis" : "OK",
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}&frame_id=${frameId}`,
      cancel_url: `${FRONTEND_URL}/?frame=${frameId}`,
      metadata: {
        frameId: frameId,
        planId: planId,
      },
    });

    // Retourner l'URL directement pour redirection
    res.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Erreur Stripe:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la création de la session de paiement" });
  }
});

// Route de santé
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Serveur backend en cours d'exécution",
    stripe: stripe ? "Configuré" : "Non configuré",
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(
    `🚀 Serveur backend démarré sur ${API_URL || "http://localhost:" + PORT}`
  );
  console.log(`📁 Dossier uploads: ${uploadsDir}`);
  console.log(`💾 Base de données: ${dbPath}`);
  console.log(`💳 Stripe: ${stripe ? "✅ Configuré" : "❌ Non configuré"}`);
  console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
});
