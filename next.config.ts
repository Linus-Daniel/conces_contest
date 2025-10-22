import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    loader: "cloudinary",
    unoptimized: true,
    path: "https://res.cloudinary.com/dzr3vlosq/",
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
