/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
       {
        protocol: "https",
        hostname: "wary-tegu-181.convex.cloud"
       }
    ]
  }
};

export default nextConfig;
