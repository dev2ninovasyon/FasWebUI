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
  Collapse,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import { SvgIconProps } from "@mui/material/SvgIcon";
import { styled } from "@mui/material/styles";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import {
  TreeItem,
  TreeItemProps,
  treeItemClasses,
} from "@mui/x-tree-view/TreeItem";
import { useSpring, animated } from "react-spring";
import { TransitionProps } from "@mui/material/transitions";
import {
  IconFolderPlus,
  IconFolderMinus,
  IconFolder,
  IconDownload,
} from "@tabler/icons-react";
import axios from "axios";
import { url } from "@/api/apiBase";
import { createAuthorizedAxiosConfig } from "@/utils/authSession";
import { useEffect, useState } from "react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import BelgeTable from "@/app/(Uygulama)/components/DigerIslemler/Arsiv/BelgeTable";
import { getArsivTumu } from "@/api/Arsiv/Arsiv";
import WarnBox from "@/app/(Uygulama)/components/Alerts/WarnBox";

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
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    node: Veri;
  } | null>(null);

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const uyari = [
    "Arşivin oluşturulabilmesi için öncelikle 'Sözleşme' menüsünde 'Bağımsız Denetim Sözleşmesi' oluşturulmalıdır.",
  ];

  const hasExtension = (name: string) => /\.[a-z0-9]{1,10}$/i.test(name);

  const countFiles = (node: Veri): number => {
    if (!Array.isArray(node.children)) return 0;
    let count = 0;
    for (const child of node.children) {
      if (hasExtension(child.name)) count++;
      else count += countFiles(child);
    }
    return count;
  };

  const collectFileUrls = (node: Veri): string[] => {
    if (!Array.isArray(node.children)) return [];
    const urls: string[] = [];
    for (const child of node.children) {
      if (hasExtension(child.name) && child.url) urls.push(child.url);
      else urls.push(...collectFileUrls(child));
    }
    return urls;
  };

  const downloadFolder = async (node: Veri) => {
    const paths = collectFileUrls(node);
    if (paths.length === 0) return;
    try {
      setDownloading(true);
      const response = await axios.post(
        `${url}/ArsivIslemleri/IndirToplu`,
        paths,
        createAuthorizedAxiosConfig(
          { responseType: "blob", headers: { accept: "*/*", "Content-Type": "application/json" } },
          user.token
        )
      );
      const urlFile = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = urlFile;
      link.setAttribute("download", `${node.name}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(urlFile), 0);
    } catch (error) {
      console.log("İndirme hatası:", error);
    } finally {
      setDownloading(false);
      setContextMenu(null);
    }
  };

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
      <IconFolderMinus style={{ width: 22, height: 22 }} {...props} />
    );
  }

  function PlusSquare(props: SvgIconProps) {
    return (
      <IconFolderPlus style={{ width: 22, height: 22 }} {...props} />
    );
  }

  function CloseSquare(props: SvgIconProps) {
    return (
      <IconFolder style={{ width: 22, height: 22 }} {...props} />
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

    const AnimatedDiv = animated.div as any;

    return (
      <AnimatedDiv style={style}>
        <Collapse {...props} />
      </AnimatedDiv>
    );
  }

  const StyledTreeItem = styled((props: TreeItemProps) => (
    <TreeItem {...props} slots={{ groupTransition: TransitionComponent }} />
  ))(({ theme }) => ({
    [`& .${treeItemClasses.iconContainer}`]: {
      "& .close": {
        opacity: 0.3,
      },
    },
    // treeItemClasses.group removed in newer versions, check if this style is needed
    // or replace with suitable class if indentation is lost.
    // For now commenting out to avoid build error, as indentation is usually default.
    /* [`& .${treeItemClasses.group}`]: {
      marginLeft: 15,
      paddingLeft: 18,
      borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
    }, */
  }));

  const renderTree = (node: Veri, level: number = 0, parentPath: string = "", index: number = 0) => {
    const isFile = hasExtension(node.name);
    // Dosyaları sol ağaçta gösterme
    if (isFile) return null;

    const uniquePath = parentPath ? `${parentPath}-${index}_${node.id}` : `root-${index}_${node.id}`;
    const fileCount = countFiles(node);

    // Çocuklardan sadece klasörleri al ve isme göre sırala
    const folderChildren = Array.isArray(node.children)
      ? node.children
        .filter((child) => !hasExtension(child.name))
        .sort((a, b) => a.name.localeCompare(b.name, "tr"))
      : [];

    return (
      <StyledTreeItem
        key={uniquePath}
        itemId={uniquePath}
        label={
          <Typography variant={level === 0 ? "h6" : "body1"}>
            {node.name} ({fileCount})
          </Typography>
        }
        onClick={() => setSelectedRow(node)}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setContextMenu({ mouseX: e.clientX, mouseY: e.clientY, node });
        }}
        sx={{ my: 1, p: 0 }}
      >
        {folderChildren.length > 0 &&
          folderChildren.map((child, childIdx) => renderTree(child, level + 1, uniquePath, childIdx))}
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
    setLoading(true);
    try {
      const data = await getArsivTumu(
        user.denetciId || 0,
        user.denetlenenId || 0
      );
      setRows(data || []);
    } catch (error) {
      console.log("An error occurred:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.denetciId && user.denetlenenId) {
      if (!silTiklandimi) {
        fetchData();
      } else {
        setRows([]);
        setSelectedRow(null);
        setSearchTerm("");
      }
    }
  }, [user.denetciId, user.denetlenenId, silTiklandimi]);

  return (
    <PageContainer title="Arşiv" description="this is Arşiv">
      <Breadcrumb title="Arşiv" items={BCrumb} />
      <Grid container spacing={3}>
        {!loading && rows.length === 0 && (
          <Grid
            size={{
              xs: 12,
              md: 12,
              lg: 12
            }}>
            <WarnBox warn={uyari} noMargin />
          </Grid>
        )}
        <Grid
          mb={3}
          size={{
            xs: 12,
            md: 12,
            lg: 4
          }}>
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
                display: loading ? "flex" : "block",
                justifyContent: "center",
                alignItems: loading ? "center" : "initial",
              }}
            >
              {loading ? (
                <CircularProgress size={40} />
              ) : rows && rows.length > 0 ? (
                <SimpleTreeView
                  aria-label="customized"
                  slots={{
                    collapseIcon: MinusSquare,
                    expandIcon: PlusSquare,
                    endIcon: CloseSquare,
                  }}
                >
                  {filterTree(rows, searchTerm)
                    .filter((row) => !hasExtension(row.name))
                    .sort((a, b) => a.name.localeCompare(b.name, "tr"))
                    .map((row, index) =>
                      renderTree(row, 0, "", index)
                    )}
                </SimpleTreeView>
              ) : (
                <Box p={2} textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Arşiv verisi bulunamadı.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Grid>
        <Grid
          mb={3}
          size={{
            xs: 12,
            md: 12,
            lg: 8
          }}>
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
      <Menu
        open={contextMenu !== null}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem
          onClick={() => contextMenu && downloadFolder(contextMenu.node)}
          disabled={
            downloading ||
            (contextMenu ? collectFileUrls(contextMenu.node).length === 0 : true)
          }
        >
          <ListItemIcon>
            {downloading ? <CircularProgress size={18} /> : <IconDownload size={18} />}
          </ListItemIcon>
          {downloading
            ? "İndiriliyor..."
            : contextMenu
            ? `${collectFileUrls(contextMenu.node).length} Dosyayı İndir`
            : "İndir"}
        </MenuItem>
      </Menu>
    </PageContainer>
  );
};

export default Page;

