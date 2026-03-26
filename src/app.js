import express from "express"
import cors from "cors"


const app = express()


// 🔹 Global Middlewares
app.use(cors());
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});


export default app;