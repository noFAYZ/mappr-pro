import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [new URL('https://s3.amazonaws.com/**'), new URL('https://chain-icons.s3.amazonaws.com/**'), new URL('https://chains.s3.amazonaws.com/**')],
  },
};

export default nextConfig;
