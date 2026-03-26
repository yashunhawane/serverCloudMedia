import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    userName: {
      type: String,
      required: true, // snapshot of username (denormalized)
    },

    media_type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },

    file_url: {
      type: String,
      required: true,
    },

    is_favorite: {
      type: Boolean,
      default: false,
    },

    // created_at handled automatically
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

export default mongoose.model("Media", mediaSchema);