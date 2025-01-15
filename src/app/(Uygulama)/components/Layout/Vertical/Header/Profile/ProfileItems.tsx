import * as Data from "@/app/(Uygulama)/components/Layout/Vertical/Header/data";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useDispatch, useSelector } from "@/store/hooks";
import ProfileItem from "./ProfileItem";
import ProfileCollapse from "./ProfileCollapse";
import { AppState } from "@/store/store";
import { toggleMobileSidebar } from "@/store/customizer/CustomizerSlice";

const ProfileItems = () => {
  const pathname = usePathname();
  const pathDirect = pathname.split("/").slice(0, 2).join("/");
  const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf("/"));
  const customizer = useSelector((state: AppState) => state.customizer);
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));

  const dispatch = useDispatch();
  return (
    <Box sx={{ px: 0 }}>
      <List sx={{ pt: 0 }}>
        {Data.profile.map((item) => {
          /* eslint no-else-return: "off" */
          if (item.children) {
            return (
              <ProfileCollapse
                menu={item}
                pathDirect={pathDirect}
                pathWithoutLastPart={pathWithoutLastPart}
                level={1}
                key={item.id}
                onClick={() => dispatch(toggleMobileSidebar())}
              />
            );

            // {/********If Sub No Menu**********/}
          } else {
            return (
              <ProfileItem
                item={item}
                key={item.id}
                pathDirect={pathDirect}
                onClick={() => dispatch(toggleMobileSidebar())}
              />
            );
          }
        })}
      </List>
    </Box>
  );
};
export default ProfileItems;
