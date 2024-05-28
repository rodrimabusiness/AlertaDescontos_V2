/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["m.media-amazon.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.worten.pt",
        port: "",
        pathname: "/**",
      },
    ],
  },
  output: "export", // Utilize 'output: export' no lugar de 'next export'
};

module.exports = nextConfig;
