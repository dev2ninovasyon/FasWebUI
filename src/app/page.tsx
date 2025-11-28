import fs from "fs";
import path from "path";
import LoginPageClient from "./auth/LoginPageClient";

export const dynamic = "force-dynamic";

export default function Page() {
  const directoryPath = path.join(process.cwd(), "public", "login-assets");
  let imagePath = "";

  try {
    const files = fs.readdirSync(directoryPath);
    const images = files.filter((file) => /\.(png|jpe?g|gif|svg|webp)$/i.test(file));
    if (images.length > 0) {
      const randomImage = images[Math.floor(Math.random() * images.length)];
      imagePath = `/login-assets/${randomImage}`;
    }
  } catch (err) {
    console.error("Error reading login assets directory:", err);
  }

  return <LoginPageClient imagePath={imagePath} />;
}

Page.layout = "Blank";
