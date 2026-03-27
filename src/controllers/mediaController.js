import mongoose from "mongoose";
import { uploadMedia, getUserMedia, updateMediaFavorite } from "../services/mediaService.js";

export const uploadMediaController = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file provided" });
    }

    // req.user is set by authMiddleware after JWT verification
    const userId = req.user.id;
    const userName = req.user.userName;

    const media = await uploadMedia({ file, userId, userName });

    return res.status(201).json({
      message: "Media uploaded successfully",
      data: media,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: error.message || "Upload failed" });
  }
};

export const getMediaController = async (req, res) => {
  try {
    const userId = req.user.id;
 
    // optional query params: ?media_type=image&is_favorite=true&page=1&limit=20
    const { media_type, is_favorite, page, limit } = req.query;
 
    const options = {
      ...(media_type && { media_type }),
      ...(is_favorite !== undefined && { is_favorite: is_favorite === "true" }),
      ...(page && { page }),
      ...(limit && { limit }),
    };
 
    const result = await getUserMedia(userId, options);
 
    return res.status(200).json({
      message: "Media fetched successfully",
      ...result,
    });
  } catch (error) {
    console.error("Fetch error:", error);
    return res.status(500).json({ message: error.message || "Fetch failed" });
  }
};

export const getFavoriteMediaController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { media_type, page, limit } = req.query;

    const options = {
      is_favorite: true,
      ...(media_type && { media_type }),
      ...(page && { page }),
      ...(limit && { limit }),
    };

    const result = await getUserMedia(userId, options);

    return res.status(200).json({
      message: "Favorite media fetched successfully",
      ...result,
    });
  } catch (error) {
    console.error("Favorite fetch error:", error);
    return res.status(500).json({
      message: error.message || "Favorite fetch failed",
    });
  }
};

export const updateMediaFavoriteController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { mediaId } = req.params;
    const { is_favorite } = req.body;
    

    if (!mongoose.isValidObjectId(mediaId)) {
      return res.status(400).json({ message: "Invalid media id" });
    }

    if (typeof is_favorite !== "boolean") {
      return res.status(400).json({
        message: "is_favorite must be a boolean",
      });
    }

    const media = await updateMediaFavorite(userId, mediaId, is_favorite);

    return res.status(200).json({
      message: "Favorite status updated successfully",
      data: media,
    });
  } catch (error) {
    console.error("Favorite update error:", error);

    if (error.message === "Media not found") {
      return res.status(404).json({ message: error.message });
    }

    return res.status(500).json({
      message: error.message || "Favorite update failed",
    });
  }
};
