/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["m.media-amazon.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.worten.pt",
        port: "",
        pathname: "/**", // Adjust this pathname pattern according to your needs
      },
    ],
  },
};

module.exports = nextConfig;
