/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["res.cloudinary.com", "localhost"], // ✅ Allow both Cloudinary and localhost images
  },
};

export default nextConfig;
