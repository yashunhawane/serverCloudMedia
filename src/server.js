// src/server.js

import app from "./app.js";




const PORT = 5000;

// 🔹 Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});