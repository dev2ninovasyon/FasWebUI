import React from "react";
import { usePathname } from "next/navigation";
import OrneklemFisleriTable from "@/app/(Uygulama)/components/DenetimKanitlari/Onemlilik/OrneklemFisleriTable";

const OrneklemFisleri = () => {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const idIndex = segments.indexOf("OrneklemFisleri") + 1;
  const pathKebirKodu = parseInt(segments[idIndex]);

  return <OrneklemFisleriTable kebirKodu={pathKebirKodu} />;
};

export default OrneklemFisleri;
