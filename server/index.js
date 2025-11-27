import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Servir les fichiers statiques du dossier uploads avec CORS pour les images
app.use("/uploads", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET");
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}, express.static(uploadsDir));

// Configuration de Multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = crypto.randomBytes(16).toString("hex");
    const ext = path.extname(file.originalname);
    cb(null, `frame-${uniqueId}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Seules les images sont autorisées"));
    }
  },
});

// Base de données simple en mémoire (JSON)
const dbPath = path.join(__dirname, "frames.json");

// Initialiser la base de données si elle n'existe pas
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ frames: [] }));
}

// Fonctions helper pour la base de données
const readDB = () => {
  const data = fs.readFileSync(dbPath, "utf8");
  return JSON.parse(data);
};

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// Routes API

// Upload un nouveau cadre
app.post("/api/frames/upload", upload.single("frame"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier uploadé" });
    }

    // Générer un ID unique pour le cadre
    const frameId = crypto.randomBytes(8).toString("hex");

    // Informations du cadre
    const frameData = {
      id: frameId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/${req.file.filename}`,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date().toISOString(),
    };

    // Sauvegarder dans la base de données
    const db = readDB();
    db.frames.push(frameData);
    writeDB(db);

    // Retourner l'ID et l'URL
    res.json({
      success: true,
      frameId: frameId,
      frameUrl: `http://localhost:${PORT}${frameData.path}`,
      shareUrl: `http://localhost:5174/?frame=${frameId}`,
    });
  } catch (error) {
    console.error("Erreur lors de l'upload:", error);
    res.status(500).json({ error: "Erreur lors de l'upload du cadre" });
  }
});

// Récupérer les informations d'un cadre par ID
app.get("/api/frames/:id", (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();
    const frame = db.frames.find((f) => f.id === id);

    if (!frame) {
      return res.status(404).json({ error: "Cadre non trouvé" });
    }

    res.json({
      success: true,
      frame: {
        id: frame.id,
        url: `http://localhost:${PORT}${frame.path}`,
        originalName: frame.originalName,
        uploadedAt: frame.uploadedAt,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération:", error);
    res.status(500).json({ error: "Erreur lors de la récupération du cadre" });
  }
});

// Récupérer tous les cadres
app.get("/api/frames", (req, res) => {
  try {
    const db = readDB();
    const frames = db.frames.map((frame) => ({
      id: frame.id,
      url: `http://localhost:${PORT}${frame.path}`,
      originalName: frame.originalName,
      uploadedAt: frame.uploadedAt,
    }));

    res.json({
      success: true,
      frames: frames,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des cadres" });
  }
});

// Route de test
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Serveur backend en cours d'exécution" });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT}`);
  console.log(`📁 Dossier uploads: ${uploadsDir}`);
  console.log(`💾 Base de données: ${dbPath}`);
});
