import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectToDatabase } from "./config/db.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import foodRouter from "./routes/foodRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

const port = process.env.PORT || 5000;

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "FoodWise backend" });
});

// API routes
app.use("/api", foodRouter);

// 404 and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  try {
    if (process.env.MONGO_URI) {
      await connectToDatabase(process.env.MONGO_URI);
    }
    app.listen(port, () => {
      console.log(`FoodWise backend listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

start();


