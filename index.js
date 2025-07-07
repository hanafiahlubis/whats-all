import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { client } from "./db.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import multer from "multer";

const upload = multer({ dest: "public/photos", });
const type = upload.single('file')
const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());

app.post("/api/akun", type, async (req, res) => {
  try {
    const result = await client.query("SELECT username FROM users");
    let ada = false;
    result.rows.forEach((e) => e.username === req.body.username ? ada = true : "");

    if (ada) {
      return res.status(400).json({ message: "Username sudah ada" });
    } else {
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(req.body.password, salt);
      await client.query(
        `INSERT INTO users (username, password, full_name, photo) VALUES ('${req.body.username}', '${hash}', '${req.body.name}', '${req.file.filename}')`
      );
      res.status(201).json({ message: "Akun berhasil ditambahkan." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan, coba lagi nanti." });
  }
});

// Edit Password
app.put("/api/edit-password/akun", async (req, res) => {
  try {
    const result = await client.query(`SELECT * FROM users WHERE username = '${req.body.username}'`);
    if (result.rows.length > 0) {
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(req.body.password, salt);
      await client.query(`UPDATE users SET password = '${hash}' WHERE username = '${req.body.username}'`);
      res.status(200).json({ message: "Password berhasil diubah." });
    } else {
      res.status(404).json({ message: "Username tidak ditemukan." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan, coba lagi nanti." });
  }
});

app.use(cookieParser());

app.use((req, res, next) => {
  if (req.path === "/api/login" || req.path.startsWith("/assets")) {
    next();
  } else {
    let authorized = false;
    if (req.cookies.token) {
      try {
        req.me = jwt.verify(req.cookies.token, process.env.SECRET_KEY);
        authorized = true;
      } catch (err) {
        res.setHeader("Cache-Control", "no-store"); // khusus Vercel
        res.clearCookie("token");
      }
    }
    if (authorized) {
      if (req.path.startsWith("/login")) {
        res.redirect("/");
      } else {
        next();
      }
    } else {
      if (req.path.startsWith("/login")) {
        next();
      } else {
        if (req.path.startsWith("/api")) {
          res.status(401).json({ message: "Anda harus login terlebih dahulu." });
        } else {
          res.redirect("/login");
        }
      }
    }
  }
});

// Untuk mengakses file statis(khusus Vercel)
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/login", async (req, res) => {
  try {
    const results = await client.query(
      `SELECT * FROM users WHERE username = '${req.body.username}'`
    );
    if (results.rows.length > 0) {
      if (await bcrypt.compare(req.body.password, results.rows[0].password)) {
        const token = jwt.sign(results.rows[0], process.env.SECRET_KEY);
        res.cookie("token", token);
        res.status(200).json({ message: "Login berhasil." });
      } else {
        res.status(401).json({ message: "Kata sandi salah." });
      }
    } else {
      res.status(401).json({ message: "Username tidak ditemukan." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan, coba lagi nanti." });
  }
});

// Dapatkan username yang login
app.get("/api/me", async (req, res) => {
  try {
    const result = await client.query(`SELECT * FROM users WHERE id = ${req.me.id}`);
    req.me = result.rows[0];
    res.json(req.me);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan, coba lagi nanti." });
  }
});

app.get("/api/logout", (_req, res) => {
  res.setHeader("Cache-Control", "no-store"); // khusus Vercel
  res.clearCookie("token");
  res.status(200).json({ message: "Logout berhasil." });
});

app.get("/api/users", async (_req, res) => {
  try {
    const results = await client.query("SELECT * FROM users ORDER BY id ASC");
    res.json(results.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan, coba lagi nanti." });
  }
});

app.put("/api/bio", type, async (req, res) => {
  try {
    if (req.hasOwnProperty('file'))
      await client.query(`UPDATE users SET full_name = '${req.body.nama}', username = '${req.body.username}', photo = '${req.file.filename}' WHERE id = ${req.me.id}`);
    else
      await client.query(`UPDATE users SET full_name = '${req.body.nama}', username = '${req.body.username}' WHERE id = ${req.me.id}`);
    res.status(200).json({ message: "Profil berhasil diubah." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan, coba lagi nanti." });
  }
});

app.get("/api/messages/:id", async (req, res) => {
  try {
    const idPenerima = parseInt(req.params.id);
    const data = await client.query(`SELECT * FROM pesan WHERE id_pengirim = ${req.me.id} AND id_penerima = ${idPenerima} OR id_pengirim = ${idPenerima} AND id_penerima = ${req.me.id} ORDER BY tanggal_waktu ASC`);
    res.json(data.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan, coba lagi nanti." });
  }
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT} dan berjalan di http://localhost:${PORT}`);
});
