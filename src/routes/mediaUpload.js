import express from "express";
import authMiddleware from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import {
  uploadMediaController,
  getMediaController,
  getFavoriteMediaController,
  updateMediaFavoriteController,
} from "../controllers/mediaController.js";

const router = express.Router();

/**
 * POST /api/media/upload
 * Headers: Authorization: Bearer <token>
 * Body: multipart/form-data  { file: <image or video> }
 */
router.post(
  "/upload",
  authMiddleware,             // 1. verify JWT → attaches req.user
  upload.single("file"),      // 2. parse multipart, store in req.file (memory)
  uploadMediaController       // 3. upload to S3 + save to DB
);

/**
 * GET /api/media
 * Headers: Authorization: Bearer <token>
 * Query params (all optional):
 *   ?media_type=image|video
 *   &is_favorite=true|false
 *   &page=1
 *   &limit=20
 */
router.get("/getimages", authMiddleware, getMediaController);

/**
 * GET /api/media/favorites
 * Headers: Authorization: Bearer <token>
 * Query params (optional):
 *   ?media_type=image|video
 *   &page=1
 *   &limit=20
 */
router.get("/favorites", authMiddleware, getFavoriteMediaController);

/**
 * PUT /api/media/:mediaId/favorite
 * Headers: Authorization: Bearer <token>
 * Body: { "is_favorite": true|false }
 */
router.put("/:mediaId/favorite", authMiddleware, updateMediaFavoriteController);

export default router;
