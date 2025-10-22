import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "storage.googleapis.com",
      "images.unsplash.com",
      "avatars.githubusercontent.com",
      "res.cloudinary.com",
      "lh3.googleusercontent.com",
    ],
  },
};

export default nextConfig;
