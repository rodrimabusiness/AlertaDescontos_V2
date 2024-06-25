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
  experimental: {
    serverComponentsExternalPackages: [
      "puppeteer",
      "puppeteer-extra",
      "puppeteer-extra-plugin-stealth",
    ],
    serverMinification: false, // required by DEFER platform
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("puppeteer-core");
    }
    return config;
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "x-vercel-function-max-duration",
            value: "60",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
