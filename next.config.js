/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["m.media-amazon.com"],
    // Add remotePatterns to include worten.pt
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.worten.pt",
        port: "",
        pathname: "/**", // Adjust this pathname pattern according to your needs
      },
    ],
  },
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: [
      "puppeteer",
      "puppeteer-extra",
      "puppeteer-extra-plugin-stealth",
    ],
    serverMinification: false, // required by DEFER platform
  },
};

module.exports = nextConfig;
