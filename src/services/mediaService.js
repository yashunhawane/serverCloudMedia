import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import s3Client, { BUCKET_NAME } from "../config/awsS3.js";
import Media from "../models/Media.js";

/**
 * Uploads a file buffer to S3 and returns the public URL.
 */
const uploadToS3 = async (file) => {
  const ext = path.extname(file.originalname);
  const key = `media/${uuidv4()}${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return fileUrl;
};

/**
 * Determines media_type from mimetype.
 */
const resolveMediaType = (mimetype) => {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  throw new Error("Unsupported media type");
};

/**
 * Full flow: upload to S3, then save metadata to MongoDB.
 */
export const uploadMedia = async ({ file, userId, userName }) => {
  const fileUrl = await uploadToS3(file);
  const mediaType = resolveMediaType(file.mimetype);

  const media = await Media.create({
    user_id: userId,
    userName,
    media_type: mediaType,
    file_url: fileUrl,
  });

  return media;
};


/**
 * Get all media for a specific user with optional filters.

 */
export const getUserMedia = async (userId, options = {}) => {
  const { media_type, is_favorite, page = 1, limit = 20 } = options;
 
  const filter = { user_id: userId };
 
  // optional filters
  if (media_type) filter.media_type = media_type;
  if (is_favorite !== undefined) filter.is_favorite = is_favorite;
 
  const skip = (page - 1) * limit;
 
  const [items, total] = await Promise.all([
    Media.find(filter)
      .sort({ createdAt: -1 })  // newest first
      .skip(skip)
      .limit(Number(limit)),
    Media.countDocuments(filter),
  ]);
 
  return {
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit),
    items,
  };
};

export const updateMediaFavorite = async (userId, mediaId, isFavorite) => {
  const media = await Media.findOneAndUpdate(
    { _id: mediaId, user_id: userId },
    { is_favorite: isFavorite },
    { new: true, runValidators: true }
  );

  if (!media) {
    throw new Error("Media not found");
  }

  return media;
};
