import { FC } from "react";
import { useSelector } from "@/store/hooks";
import Link from "next/link";
import { styled } from "@mui/material/styles";
import { AppState } from "@/store/store";
import Image from "next/image";

const CollapseLogo = () => {
  const customizer = useSelector((state: AppState) => state.customizer);
  const LinkStyled = styled(Link)(() => ({
    height: customizer.TopbarHeight,
    width: customizer.isCollapse ? "45px" : "188px",
    marginTop: customizer.isCollapse ? "10px" : "0px",
    paddingLeft: "2px",
    overflow: "hidden",
    display: "block",
  }));

  if (customizer.activeDir === "ltr") {
    return (
      <LinkStyled href="/">
        {customizer.activeMode === "dark" ? (
          <Image
            src="/images/logos/fas-logo.png"
            alt="logo"
            height={45}
            width={42}
            style={{ padding: "2px" }}
            priority
          />
        ) : (
          <Image
            src={"/images/logos/fas-logo.png"}
            alt="logo"
            height={45}
            width={42}
            style={{ padding: "2px" }}
            priority
          />
        )}
      </LinkStyled>
    );
  }

  return (
    <LinkStyled href="/">
      {customizer.activeMode === "dark" ? (
        <Image
          src="/images/logos/fas-logo.png"
          alt="logo"
          height={45}
          width={42}
          style={{ padding: "2px" }}
          priority
        />
      ) : (
        <Image
          src="/images/logos/fas-logo.png"
          alt="logo"
          height={45}
          width={42}
          style={{ padding: "2px" }}
          priority
        />
      )}
    </LinkStyled>
  );
};

export default CollapseLogo;
