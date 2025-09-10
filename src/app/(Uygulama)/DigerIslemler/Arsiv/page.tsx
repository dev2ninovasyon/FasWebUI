"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import {
  Box,
  Grid,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { SvgIconProps } from "@mui/material/SvgIcon";
import { alpha, styled } from "@mui/material/styles";
import { TreeView } from "@mui/x-tree-view/TreeView";
import {
  TreeItem,
  TreeItemProps,
  treeItemClasses,
} from "@mui/x-tree-view/TreeItem";
import { useSpring, animated } from "react-spring";
import { Collapse } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import {
  IconFileText,
  IconFolderPlus,
  IconFolderMinus,
  IconFolder,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import BelgeTable from "@/app/(Uygulama)/components/DigerIslemler/Arsiv/BelgeTable";
import { getArsiv } from "@/api/Arsiv/Arsiv";

const BCrumb = [
  {
    to: "/DigerIslemler",
    title: "Diğer İşlemler",
  },
  {
    to: "/DigerIslemler/Arsiv",
    title: "Arşiv",
  },
];

interface Veri {
  id: number;
  parentId?: number;
  name: string;
  bds?: string;
  code?: string;
  url?: string;
  reference?: string;
  archiveFileName?: string;
  size?: string;
  date?: string;
  children: Veri[];
}

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const theme = useTheme();
  const borderColor = theme.palette.divider;
  const borderRadius = theme.shape.borderRadius;

  const [rows, setRows] = useState<Veri[]>([]);
  const [selectedRow, setSelectedRow] = useState<Veri | null>(null);

  const [silTiklandimi, setSilTiklandimi] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const hasExtension = (name: string) => /\.[a-z0-9]{1,10}$/i.test(name);

  function normalizeString(str: string): string {
    const turkishChars: { [key: string]: string } = {
      ç: "c",
      ğ: "g",
      ı: "i",
      ö: "o",
      ş: "s",
      ü: "u",
      Ç: "C",
      Ğ: "G",
      İ: "I",
      Ö: "O",
      Ş: "S",
      Ü: "U",
    };

    // Türkçe karakterleri değiştir
    let normalized = str.replace(
      /[çğıöşüÇĞÖŞÜıİ]/g,
      (match) => turkishChars[match] || match
    );

    // Tüm boşluk, tab, satır başı/sonu karakterlerini sil
    normalized = normalized.replace(/\s+/g, "");

    // Küçük harfe çevir
    return normalized.toLowerCase();
  }

  function MinusSquare(props: SvgIconProps) {
    return (
      <>
        <IconFolderMinus style={{ width: 22, height: 22 }} {...props} />
      </>
    );
  }

  function PlusSquare(props: SvgIconProps) {
    return (
      <>
        <IconFolderPlus style={{ width: 22, height: 22 }} {...props} />
      </>
    );
  }

  function CloseSquare(props: SvgIconProps) {
    return (
      <>
        <IconFolder style={{ width: 22, height: 22 }} {...props} />
      </>
    );
  }

  function TransitionComponent(props: TransitionProps) {
    const style = useSpring({
      from: {
        opacity: 0,
        transform: "translate3d(20px,0,0)",
      },
      to: {
        opacity: props.in ? 1 : 0,
        transform: `translate3d(${props.in ? 0 : 20}px,0,0)`,
      },
    });

    return (
      <animated.div style={style}>
        <Collapse {...props} />
      </animated.div>
    );
  }

  const StyledTreeItem = styled((props: TreeItemProps) => (
    <TreeItem {...props} TransitionComponent={TransitionComponent} />
  ))(({ theme }) => ({
    [`& .${treeItemClasses.iconContainer}`]: {
      "& .close": {
        opacity: 0.3,
      },
    },
    [`& .${treeItemClasses.group}`]: {
      marginLeft: 15,
      paddingLeft: 18,
      borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
    },
  }));

  const renderTree = (node: Veri, level: number = 0) => {
    const isFile = hasExtension(node.name);

    return (
      <StyledTreeItem
        key={node.id}
        nodeId={node.id.toString()}
        label={
          <Typography variant={level === 0 ? "h6" : "body1"}>
            {node.name}
          </Typography>
        }
        // Belge ise tıklanmasın
        disabled={isFile}
        // Belge için ikon
        endIcon={
          isFile ? (
            <IconFileText style={{ width: 20, height: 20 }} />
          ) : undefined
        }
        // Klasörse seçim yap
        onClick={isFile ? undefined : () => setSelectedRow(node)}
        sx={{ my: 1, p: 0 }}
      >
        {/* Belge ise çocukları render etme; klasörse devam */}
        {!isFile &&
          Array.isArray(node.children) &&
          node.children.length > 0 &&
          node.children.map((child) => renderTree(child, level + 1))}
      </StyledTreeItem>
    );
  };

  const filterTree = (nodes: Veri[], term: string): Veri[] => {
    if (!term) return nodes;

    const normalizedTerm = normalizeString(term);

    return nodes
      .map((node) => {
        const normalizedName = normalizeString(node.name);

        if (node.children) {
          const filteredChildren = filterTree(node.children, term);

          if (
            normalizedName.includes(normalizedTerm) ||
            filteredChildren.length > 0
          ) {
            return { ...node, children: filteredChildren };
          }
        } else {
          if (normalizedName.includes(normalizedTerm)) {
            return node;
          }
        }

        return null;
      })
      .filter((node): node is Veri => node !== null);
  };

  const fetchData = async () => {
    try {
      const data = await getArsiv(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0
      );
      setRows(data);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!silTiklandimi) {
      fetchData();
    } else {
      setRows([]);
      setSelectedRow(null);
      setSearchTerm("");
    }
  }, [silTiklandimi]);

  return (
    <PageContainer title="Arşiv" description="this is Arşiv">
      <Breadcrumb title="Arşiv" items={BCrumb} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={12} lg={4} mb={3}>
          <Box
            sx={{
              padding: 1,
              paddingRight: 0,
              height: "550px",
              border: `1px solid ${borderColor}`,
              borderRadius: `${borderRadius}/5`,
            }}
          >
            <Stack direction="row" alignItems="center" pl={1} mb={1}>
              <Box width={"100%"}>
                <Typography variant="h6">ARŞİV DOSYALARI</Typography>
              </Box>
              <TextField
                placeholder="Arama"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                sx={{ marginRight: "16px" }}
              />
            </Stack>
            <Box
              sx={{
                height: "480px",
                overflowX: "hidden",
                overflowY: "auto",
              }}
            >
              <TreeView
                aria-label="customized"
                defaultExpanded={undefined}
                defaultCollapseIcon={<MinusSquare />}
                defaultExpandIcon={<PlusSquare />}
                defaultEndIcon={<CloseSquare />}
              >
                {rows &&
                  filterTree(rows, searchTerm).map((row) => renderTree(row))}
              </TreeView>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={12} lg={8} mb={3}>
          {selectedRow ? (
            <Box
              sx={{
                paddingTop: 1,
                height: smDown ? "610px" : "550px",
                border: `1px solid ${borderColor}`,
                borderRadius: `${borderRadius}/5`,
                overflowY: "auto",
              }}
            >
              {/* Dosya listesi */}
              {selectedRow.children && selectedRow.children.length > 0 ? (
                <BelgeTable
                  title={selectedRow.name}
                  data={selectedRow.children}
                  silTiklandimi={silTiklandimi}
                  setSilTiklandimi={setSilTiklandimi}
                />
              ) : (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  mt={1}
                  ml={1}
                >
                  Bu klasörde dosya bulunamadı
                </Typography>
              )}
            </Box>
          ) : (
            <Box
              px={1}
              py={2}
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <Typography variant="body1" color="text.secondary">
                Dosya Seçiniz
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
