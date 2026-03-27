import express from "express"
import cors from "cors"
import authRoutes from "./routes/authRoutes.js";
import mediaRoutes from "./routes/mediaUpload.js";

const app = express()


// 🔹 Global Middlewares
app.use(cors());
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/media", mediaRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});


export default app;