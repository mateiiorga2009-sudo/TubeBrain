import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import OpenAI from "openai";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, "../frontend");

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(bodyParser.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "tubebrain-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Servir archivos estáticos del frontend
app.use(express.static(frontendPath));

// Configuración Passport + Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:3000/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      const user = {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails?.[0]?.value,
        photo: profile.photos?.[0]?.value,
      };
      return done(null, user);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "No autenticado." });
}

// Rutas de autenticación
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/dashboard.html");
  }
);

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

app.get("/me", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ user: null });
  }
  return res.json({ user: req.user });
});

// API protegida
app.post("/generate", ensureAuthenticated, async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea || typeof idea !== "string") {
      return res
        .status(400)
        .json({ error: "Falta el campo 'idea' o no es un texto válido." });
    }

    const prompt = `
Eres un experto en YouTube. Con la siguiente idea de video, genera contenido en este formato JSON EXACTO (sin explicaciones adicionales, solo JSON):
{
  "titles": ["titulo 1", "titulo 2", "... hasta 10"],
  "thumbnails": ["concepto 1", "concepto 2", "concepto 3"],
  "hook": "gancho de 10 segundos",
  "structure": [
    "paso 1",
    "paso 2",
    "paso 3",
    "..."
  ]
}

Idea del video: "${idea}"
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente que solo responde con JSON válido y bien formado.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.9,
    });

    const content = completion.choices[0].message.content;

    let data;
    try {
      data = JSON.parse(content);
    } catch (e) {
      return res.status(500).json({
        error:
          "No se pudo interpretar la respuesta de la IA. Reintenta nuevamente.",
      });
    }

    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error:
        "Ocurrió un error al generar el contenido. Verifica tu clave de OpenAI y vuelve a intentar.",
    });
  }
});

// Si ninguna ruta de la API o autenticación coincide, devolver index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(port, () => {
  console.log(`TubeBrain backend escuchando en http://localhost:${port}`);
});

