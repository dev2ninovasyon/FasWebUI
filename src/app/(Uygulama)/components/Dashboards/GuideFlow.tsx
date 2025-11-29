import React, { useEffect, useCallback, useMemo, useState } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    Node,
    Edge,
    Position,
    Handle,
    NodeProps,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { useSelector } from '@/store/hooks';
import { AppState } from '@/store/store';
import {
    Box,
    Typography,
    useTheme,
    Tooltip,
    Paper,
    Fade,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton
} from '@mui/material';
import { createMenuItems } from '../Layout/Vertical/Sidebar/MenuItems';
import { useRouter } from 'next/navigation';
import {
    IconArrowRight,
    IconInfoCircle,
    IconLayoutDashboard,
    IconChevronRight,
    IconUpload,
    IconTimeline,
    IconCalculator,
    IconFileAnalytics,
    IconX,
    IconUsers,
    IconUserPlus
} from '@tabler/icons-react';
import { useDispatch } from '@/store/hooks';
import {
    setBobimi,
    setDenetimTuru,
    setDenetlenenFirmaAdi,
    setDenetlenenId,
    setEnflasyonmu,
    setKonsolidemi,
    setRol,
    setTfrsmi,
    setYil,
} from '@/store/user/UserSlice';
import { getRol } from '@/api/Sozlesme/DenetimKadrosuAtama';
import CompanyBoxAutocomplete from '../Layout/Vertical/Header/CompanyBoxAutoComplete';
import YearBoxAutocomplete from '../Layout/Vertical/Header/YearBoxAutoComplete';
import { useLoading } from '@/contexts/LoadingContext';

// Kategori İkonları - 6 kategori
const CATEGORY_ICONS = {
    'Veri Girişi': IconUpload,
    'Planlama': IconTimeline,
    'Hesaplama': IconCalculator,
    'Dönüşüm': IconCalculator,
    'Denetim Kanıtları': IconFileAnalytics,
    'Rapor': IconFileAnalytics
};

// Kategori Renkleri - Her kategori farklı renk
const CATEGORY_COLORS = {
    'Veri Girişi': { main: '#0288d1', light: '#4fc3f7', dark: '#01579b' }, // Mavi
    'Planlama': { main: '#7b1fa2', light: '#ba68c8', dark: '#4a148c' }, // Mor
    'Hesaplama': { main: '#f57c00', light: '#ffb74d', dark: '#e65100' }, // Turuncu
    'Dönüşüm': { main: '#d32f2f', light: '#ef5350', dark: '#c62828' }, // Kırmızı
    'Denetim Kanıtları': { main: '#00897b', light: '#4db6ac', dark: '#00695c' }, // Yeşil
    'Rapor': { main: '#303f9f', light: '#5c6bc0', dark: '#1a237e' } // İndigo
};

interface DialogData {
    title: string;
    description: string;
    icon: any;
    href?: string;
    isCompanySelection?: boolean;
}

// Custom Node Component
const CustomGuideNode = ({ data }: NodeProps) => {
    const theme = useTheme();
    const Icon = data.icon;
    const isRoot = data.isRoot;
    const isCategory = data.isCategory;
    const categoryColor = data.categoryColor;

    const getColors = () => {
        if (isRoot) return { bg: theme.palette.primary.main, text: '#fff', border: 'transparent', isColored: true };
        if (isCategory && categoryColor) {
            return { bg: categoryColor.main, text: '#fff', border: categoryColor.dark, isColored: true };
        }
        // Check if node has custom color scheme (for welcome screen nodes)
        if (data.colorScheme) {
            return {
                bg: data.colorScheme.main,
                text: '#fff',
                border: data.colorScheme.dark,
                isColored: true,
                gradient: `linear-gradient(135deg, ${data.colorScheme.main} 0%, ${data.colorScheme.dark} 100%)`
            };
        }
        return { bg: theme.palette.background.paper, text: theme.palette.text.primary, border: theme.palette.divider, isColored: false };
    };

    const colors = getColors();

    return (
        <Tooltip
            title={data.description || "Detaylar için tıklayın"}
            arrow
            placement="right"
            TransitionComponent={Fade}
            slotProps={{
                tooltip: {
                    sx: {
                        fontSize: '0.95rem',
                        lineHeight: 1.6,
                        maxWidth: 400,
                        padding: '12px 16px'
                    }
                }
            }}
        >
            <Paper
                elevation={isRoot ? 8 : isCategory ? 6 : colors.isColored ? 5 : 4}
                sx={{
                    padding: isRoot ? '24px' : isCategory ? '18px 20px' : '16px 20px',
                    borderRadius: isRoot ? '16px' : '14px',
                    background: colors.gradient || (isRoot || isCategory
                        ? `linear-gradient(135deg, ${colors.bg} 0%, ${isCategory ? categoryColor?.dark : theme.palette.primary.dark} 100%)`
                        : colors.bg),
                    border: `2px solid ${colors.border}`,
                    minWidth: isRoot ? 300 : isCategory ? 240 : 240,
                    maxWidth: 320,
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: isRoot || isCategory
                            ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)'
                            : 'linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0) 100%)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                    },
                    '&:hover': {
                        transform: isRoot ? 'scale(1.03)' : 'translateY(-8px) scale(1.02)',
                        boxShadow: isRoot
                            ? theme.shadows[16]
                            : `0 12px 40px -8px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.2)'}`,
                        '&::before': {
                            opacity: 1,
                        },
                        '& .arrow-icon': {
                            opacity: 1,
                            transform: 'translateX(6px)'
                        },
                        '& .icon-box': {
                            transform: 'rotate(5deg) scale(1.1)',
                        }
                    },
                }}
            >
                <Handle type="target" position={Position.Top} style={{ background: theme.palette.text.disabled, width: 10, height: 10 }} />

                <Box
                    className="icon-box"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: isRoot ? 56 : isCategory ? 48 : 44,
                        height: isRoot ? 56 : isCategory ? 48 : 44,
                        borderRadius: '12px',
                        bgcolor: colors.isColored ? 'rgba(255,255,255,0.25)' : theme.palette.action.hover,
                        color: colors.isColored ? '#fff' : theme.palette.primary.main,
                        flexShrink: 0,
                        boxShadow: colors.isColored ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                >
                    {Icon ? <Icon size={isRoot ? 32 : isCategory ? 28 : 26} stroke={1.5} /> : <IconInfoCircle size={24} stroke={1.5} />}
                </Box>

                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                    <Typography
                        variant={isRoot ? "h5" : isCategory ? "h6" : "subtitle1"}
                        fontWeight="bold"
                        color={colors.text}
                        sx={{
                            mb: isRoot || isCategory ? 0.5 : 0.25,
                            lineHeight: 1.2
                        }}
                    >
                        {data.label}
                    </Typography>
                    {!isRoot && (
                        <Typography
                            variant="caption"
                            sx={{
                                color: colors.isColored ? 'rgba(255,255,255,0.9)' : 'text.secondary',
                                display: 'block',
                                lineHeight: 1.3,
                                fontSize: '0.75rem'
                            }}
                        >
                            {data.shortDesc || 'Tıklayarak detayları görün'}
                        </Typography>
                    )}
                </Box>

                {!isRoot && (
                    <IconChevronRight
                        size={20}
                        className="arrow-icon"
                        style={{
                            opacity: 0.6,
                            transition: 'all 0.3s ease',
                            color: colors.isColored ? '#fff' : theme.palette.text.secondary
                        }}
                    />
                )}

                <Handle type="source" position={Position.Bottom} style={{ background: theme.palette.text.disabled, width: 10, height: 10 }} />
            </Paper>
        </Tooltip>
    );
};

// Layout Helper
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const nodeWidth = 280;
    const nodeHeight = 90;

    dagreGraph.setGraph({ rankdir: direction, ranksep: 120, nodesep: 80 });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = Position.Top;
        node.sourcePosition = Position.Bottom;

        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes, edges };
};

const GuideFlow = () => {
    const user = useSelector((state: AppState) => state.userReducer);
    const theme = useTheme();
    const router = useRouter();
    const { setLoading } = useLoading();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogData, setDialogData] = useState<DialogData | null>(null);

    // Şirket ve Yıl Seçimi için state'ler
    const [selectedId, setSelectedId] = useState(0);
    const [selectedAdi, setSelectedAdi] = useState("");
    const [selectedDenetimTuru, setSelectedDenetimTuru] = useState("");
    const [selectedBobimi, setSelectedBobimi] = useState(false);
    const [selectedTfrsmi, setSelectedTfrsmi] = useState(false);
    const [selectedEnflasyonmu, setSelectedEnflasyonmu] = useState(false);
    const [selectedKonsolidemi, setSelectedKonsolidemi] = useState(false);
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedYearNumber, setSelectedYearNumber] = useState(0);

    const dispatch = useDispatch();

    const nodeTypes = useMemo(() => ({ custom: CustomGuideNode }), []);

    // localStorage'dan node pozisyonlarını yükle
    const loadNodePositions = useCallback((nodeId: string) => {
        const storageKey = `guideflow-positions-${user.denetlenenId || 'welcome'}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                const positions = JSON.parse(saved);
                return positions[nodeId];
            } catch (error) {
                console.error('Error loading node positions:', error);
            }
        }
        return null;
    }, [user.denetlenenId]);

    // Node pozisyonlarını localStorage'a kaydet
    const saveNodePositions = useCallback((nodes: Node[]) => {
        const storageKey = `guideflow-positions-${user.denetlenenId || 'welcome'}`;
        const positions: { [key: string]: { x: number; y: number } } = {};
        nodes.forEach(node => {
            positions[node.id] = { x: node.position.x, y: node.position.y };
        });
        localStorage.setItem(storageKey, JSON.stringify(positions));
    }, [user.denetlenenId]);

    // Custom onNodesChange handler to save positions
    const handleNodesChange = useCallback((changes: any) => {
        onNodesChange(changes);
        // Position değişikliği varsa kaydet
        const hasPositionChange = changes.some((change: any) =>
            change.type === 'position' && change.dragging === false
        );
        if (hasPositionChange) {
            // Küçük bir gecikme ekle (drag bitişini bekle)
            setTimeout(() => {
                setNodes((nds) => {
                    saveNodePositions(nds);
                    return nds;
                });
            }, 100);
        }
    }, [onNodesChange, setNodes, saveNodePositions]);

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        if (node.data.isSelectCompany) {
            setDialogData({
                title: node.data.label,
                description: node.data.description || 'Bir şirket seçin',
                icon: node.data.icon,
                isCompanySelection: true
            });
            setDialogOpen(true);
            return;
        }

        if (node.data.href && !node.data.isRoot && !node.data.isCategory) {
            setLoading(true);
            router.push(node.data.href);
            return;
        }

        setDialogData({
            title: node.data.label,
            description: node.data.description || 'Bu modül hakkında detaylı bilgi bulunmamaktadır.',
            icon: node.data.icon,
            href: node.data.href
        });
        setDialogOpen(true);
    }, [router, setLoading]);

    const handleDialogClose = () => {
        setDialogOpen(false);
        setDialogData(null);
    };

    const handleNavigate = () => {
        if (dialogData?.href) {
            setLoading(true);
            router.push(dialogData.href);
            handleDialogClose();
        }
    };

    const handleCompanySelect = async () => {
        await dispatch(setDenetlenenId(selectedId));
        await dispatch(setDenetlenenFirmaAdi(selectedAdi));
        await dispatch(setYil(selectedYearNumber));
        await dispatch(setDenetimTuru(selectedDenetimTuru));
        await dispatch(setBobimi(selectedBobimi));
        await dispatch(setTfrsmi(selectedTfrsmi));
        await dispatch(setEnflasyonmu(selectedEnflasyonmu));
        await dispatch(setKonsolidemi(selectedKonsolidemi));

        localStorage.setItem("fas_denetlenenId", selectedId.toString());
        localStorage.setItem("fas_yil", selectedYear.toString());

        try {
            const rolVerileri = await getRol(
                user.token || "",
                user.id || 0,
                selectedId,
                selectedYearNumber
            );
            if (rolVerileri) {
                dispatch(setRol(rolVerileri.rol));
            }
        } catch (error) {
            console.error("Bir hata oluştu:", error);
        }

        handleDialogClose();
        // Redux state güncellendiğinde useEffect otomatik olarak yeniden çalışacak
        // window.location.reload() gereksiz - state değişikliği re-render yapacak
    };

    useEffect(() => {
        // useMemo benzeri optimizasyon - menuItems sadece user değiştiğinde yeniden hesaplanıyor
        const menuItems = createMenuItems(
            user.rol,
            user.denetimTuru,
            user.enflasyonmu,
            user.konsolidemi,
            false
        );

        let newNodes: Node[] = [];
        let newEdges: Edge[] = [];

        // 6 ayrı kategori mapping
        const categoryMapping: { [key: string]: { sections: string[], color: any } } = {
            'Veri Girişi': { sections: ['VERİ'], color: CATEGORY_COLORS['Veri Girişi'] },
            'Planlama': { sections: ['PLAN VE PROGRAM'], color: CATEGORY_COLORS['Planlama'] },
            'Hesaplama': { sections: ['HESAPLAMALAR'], color: CATEGORY_COLORS['Hesaplama'] },
            'Dönüşüm': { sections: ['DÖNÜŞÜM'], color: CATEGORY_COLORS['Dönüşüm'] },
            'Denetim Kanıtları': { sections: ['DENETİM KANITLARI'], color: CATEGORY_COLORS['Denetim Kanıtları'] },
            'Rapor': { sections: ['RAPOR'], color: CATEGORY_COLORS['Rapor'] }
        };

        if (!user.denetlenenId || user.denetlenenId <= 0) {
            const rootId = 'root-welcome';
            newNodes = [
                {
                    id: rootId,
                    type: 'custom',
                    data: {
                        label: 'FAS\'a Hoş geldiniz',
                        icon: IconLayoutDashboard,
                        description: 'FasWebUI Denetim sistemine hoş geldiniz! Sistemi kullanmaya başlamak için aşağıdaki seçeneklerden birini seçin. Yeni bir şirket ekleyebilir, mevcut şirketler arasından seçim yapabilir veya kullanıcı yönetimi işlemlerinizi gerçekleştirebilirsiniz.',
                        isRoot: true
                    },
                    position: { x: 0, y: 0 }
                },
                {
                    id: 'node-add-company',
                    type: 'custom',
                    data: {
                        label: 'Yeni Şirket Ekle',
                        icon: IconUserPlus,
                        description: 'Yeni bir müşteri şirketi oluşturun ve denetim sürecine başlayın. Şirket bilgilerini, yetkililerini, sözleşme detaylarını girebileceğiniz kapsamlı bir form sayfasına yönlendirileceksiniz. Tüm şirket verileri güvenli bir şekilde saklanacaktır.',
                        shortDesc: 'Yeni müşteri şirketi oluştur',
                        href: '/Musteri/MusteriIslemleri',
                        isParent: false,
                        colorScheme: { main: '#10b981', light: '#34d399', dark: '#059669' }
                    },
                    position: { x: 0, y: 0 }
                },
                {
                    id: 'node-user-operations',
                    type: 'custom',
                    data: {
                        label: 'Kullanıcı İşlemleri',
                        icon: IconUsers,
                        description: 'Sistem kullanıcılarını yönetin, yeni kullanıcılar ekleyin, mevcut kullanıcıların bilgilerini düzenleyin veya kullanıcı rollerini ve yetkilerini güncelleyin. Denetim kadrosu atamaları, ekip yönetimi ve kullanıcı izinleri bu bölümden kontrol edilir.',
                        shortDesc: 'Kullanıcı yönetimi ve ayarları',
                        href: '/Kullanici',
                        isParent: false,
                        colorScheme: { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb' }
                    },
                    position: { x: 0, y: 0 }
                },
                {
                    id: 'node-select-company',
                    type: 'custom',
                    data: {
                        label: 'Mevcut Şirket Seç',
                        icon: IconInfoCircle,
                        description: 'Sistemde kayıtlı olan şirketler arasından seçim yapın. Seçtiğiniz şirket için denetim sürecine devam edebilir, raporları görüntüleyebilir ve tüm işlemleri gerçekleştirebilirsiniz. Şirket seçimi sonrası ilgili yıl için çalışmaya başlayabilirsiniz.',
                        shortDesc: 'Kayıtlı şirketlerden birini seç',
                        isParent: false,
                        isSelectCompany: true,
                        colorScheme: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' }
                    },
                    position: { x: 0, y: 0 }
                }
            ];
            newEdges = [
                {
                    id: 'e-root-add',
                    source: rootId,
                    target: 'node-add-company',
                    animated: true,
                    type: 'smoothstep',
                    style: { stroke: '#10b981', strokeWidth: 3 },
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981', width: 25, height: 25 }
                },
                {
                    id: 'e-root-user',
                    source: rootId,
                    target: 'node-user-operations',
                    animated: true,
                    type: 'smoothstep',
                    style: { stroke: '#3b82f6', strokeWidth: 3 },
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 25, height: 25 }
                },
                {
                    id: 'e-root-select',
                    source: rootId,
                    target: 'node-select-company',
                    animated: true,
                    type: 'smoothstep',
                    style: { stroke: '#f59e0b', strokeWidth: 3 },
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b', width: 25, height: 25 }
                }
            ];
        } else {
            // 6 Kategori Göster
            const rootId = 'root-company';
            newNodes.push({
                id: rootId,
                type: 'custom',
                data: {
                    label: user.denetlenenFirmaAdi || 'Seçili Şirket',
                    icon: IconLayoutDashboard,
                    description: `${user.denetlenenFirmaAdi} için aktif denetim süreci. Aşağıdaki kategorilerden birini seçerek işlemlerinize devam edebilirsiniz.`,
                    isRoot: true
                },
                position: { x: 0, y: 0 }
            });

            Object.entries(categoryMapping).forEach(([categoryName, { sections, color }], index) => {
                const categoryId = `category-${index}`;
                const CategoryIcon = CATEGORY_ICONS[categoryName as keyof typeof CATEGORY_ICONS];

                let categoryHref = '';
                for (const section of sections) {
                    const sectionItem = menuItems.find(item => item.title === section);
                    if (sectionItem?.href) {
                        categoryHref = sectionItem.href;
                        break;
                    }
                }

                // Her kategori için özel detaylı açıklama
                let detailedDescription = '';
                switch (categoryName) {
                    case 'Veri Girişi':
                        detailedDescription = 'Veri Girişi modülü, denetim sürecinin temelini oluşturan tüm veri toplama ve kayıt işlemlerini kapsar. Bu bölümde müşteri bilgileri, belgeler, sözleşmeler ve denetim için gerekli tüm temel verilerin sisteme girilmesi sağlanır. Şirket bilgilerinden başlayarak, finansal kayıtlara, yasal belgelere ve diğer kritik dokümanların sistematik bir şekilde kaydedilmesi bu modülün ana işlevidir.';
                        break;
                    case 'Planlama':
                        detailedDescription = 'Planlama modülü, denetim sürecinin stratejik planlamasını ve organizasyonunu içerir. Denetim programının hazırlanması, görev atamalarının yapılması, risk değerlendirmelerinin gerçekleştirilmesi ve denetim ekibinin koordinasyonu bu modülde yönetilir. Denetim takvimi, bağımsızlık beyanları, hile risk faktörleri, iç kontrol değerlendirmeleri ve denetim stratejisinin belirlenmesi gibi kritik planlama faaliyetlerinin tamamı burada gerçekleştirilir.';
                        break;
                    case 'Hesaplama':
                        detailedDescription = 'Hesaplama modülü, denetim sürecinde gerekli olan tüm finansal hesaplamaları, analizleri ve değerlendirmeleri içerir. Finansal rasyoların hesaplanması, trend analizleri, karşılaştırmalı tablolar, önemlilik seviyelerinin belirlenmesi ve çeşitli finansal metriklerin hesaplanması bu modülde gerçekleştirilir. Standart hesaplamalardan karmaşık finansal analizlere kadar geniş bir yelpazede işlemler yapılabilir.';
                        break;
                    case 'Dönüşüm':
                        detailedDescription = 'Dönüşüm modülü, farklı muhasebe standartları arasında geçiş işlemlerini ve finansal tabloların dönüştürülmesini yönetir. TFRS, SPK düzenlemeleri ve diğer standartlara uyum sağlamak için gerekli dönüşüm işlemleri, düzeltme kayıtları ve raporlama formatı değişiklikleri bu modülde gerçekleştirilir. Enflasyon muhasebesi düzeltmeleri, konsolidasyon işlemleri ve standart uyum çalışmaları da bu kapsamdadır.';
                        break;
                    case 'Denetim Kanıtları':
                        detailedDescription = 'Denetim Kanıtları modülü, denetim sürecinde toplanan tüm kanıtların, bulguların ve test sonuçlarının sistematik olarak kaydedilmesini ve dokümante edilmesini sağlar. Maddi doğruluk testleri, analitik inceleme sonuçları, örnekleme çalışmaları, kontrol testleri ve diğer tüm denetim prosedürlerinin sonuçları bu modülde saklanır. Denetim görüşünü destekleyecek yeterli ve uygun kanıtların toplanması ve belgelenmesi burada yönetilir.';
                        break;
                    case 'Rapor':
                        detailedDescription = 'Rapor modülü, denetim sürecinin sonuçlarının raporlanmasını ve paylaşımını içerir. Bağımsız denetim raporları, yönetim mektupları, iç kontrol raporları, bulgular raporu ve diğer tüm raporlama çıktılarının hazırlanması, gözden geçirilmesi ve sunulması bu modülde gerçekleştirilir. Standart rapor formatlarından özelleştirilmiş raporlara kadar geniş bir yelpazede rapor oluşturma imkanı sunar.';
                        break;
                    default:
                        detailedDescription = `${categoryName} kategorisi - İlgili modül ve işlemlere erişim için tıklayın.`;
                }

                newNodes.push({
                    id: categoryId,
                    type: 'custom',
                    data: {
                        label: categoryName,
                        icon: CategoryIcon,
                        description: detailedDescription,
                        shortDesc: sections.join(' • '),
                        href: categoryHref,
                        isCategory: true,
                        categoryColor: color
                    },
                    position: { x: 0, y: 0 }
                });

                newEdges.push({
                    id: `e-root-${categoryId}`,
                    source: rootId,
                    target: categoryId,
                    animated: true,
                    type: 'smoothstep',
                    style: { stroke: color.main, strokeWidth: 3 },
                    markerEnd: { type: MarkerType.ArrowClosed, color: color.main, width: 20, height: 20 }
                });
            });
        }

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            newNodes,
            newEdges,
            'TB'
        );

        // localStorage'dan kayıtlı pozisyonları uygula
        const nodesWithSavedPositions = layoutedNodes.map(node => {
            const savedPosition = loadNodePositions(node.id);
            if (savedPosition) {
                return { ...node, position: savedPosition };
            }
            return node;
        });

        setNodes(nodesWithSavedPositions);
        setEdges(layoutedEdges);

    }, [user, theme, setNodes, setEdges, loadNodePositions]);

    const DialogIcon = dialogData?.icon;

    return (
        <Box sx={{
            height: 700,
            width: '100%',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 4,
            mb: 3,
            bgcolor: 'background.paper',
            boxShadow: theme.shadows[2],
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Box sx={{
                p: 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`
            }}>
                <Box>
                    <Typography variant="h6" fontWeight="bold" color="textPrimary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconLayoutDashboard size={24} color={theme.palette.primary.main} />
                        Denetim Yol Haritası
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        {user.denetlenenFirmaAdi ? 'Kategoriler üzerinden denetim sürecine erişin' : 'Başlamak için bir şirket seçin'}
                    </Typography>
                </Box>
                <Chip
                    label={user.denetlenenFirmaAdi ? "Aktif" : "Bekleniyor"}
                    color={user.denetlenenFirmaAdi ? "success" : "warning"}
                    variant="filled"
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                />
            </Box>

            <Box sx={{ flex: 1, position: 'relative' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={handleNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={onNodeClick}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    attributionPosition="bottom-right"
                    defaultEdgeOptions={{ type: 'smoothstep' }}
                    minZoom={0.2}
                    maxZoom={1.5}
                >
                    <Background color={theme.palette.divider} gap={20} size={1} />
                    <Controls showInteractive={false} />
                    <MiniMap
                        nodeStrokeColor={(n) => {
                            if (n.data.isRoot) return theme.palette.primary.main;
                            if (n.data.isCategory) return n.data.categoryColor?.main || theme.palette.secondary.main;
                            return theme.palette.primary.light;
                        }}
                        nodeColor={(n) => {
                            if (n.data.isRoot) return theme.palette.primary.main;
                            if (n.data.isCategory) return n.data.categoryColor?.main || theme.palette.secondary.main;
                            return theme.palette.background.paper;
                        }}
                        maskColor="rgba(0,0,0,0.1)"
                        style={{
                            height: 120,
                            width: 180,
                            bottom: 20,
                            right: 20,
                            borderRadius: 12,
                            border: `2px solid ${theme.palette.divider}`,
                            boxShadow: theme.shadows[3]
                        }}
                    />
                </ReactFlow>
            </Box>

            <Dialog
                open={dialogOpen}
                onClose={handleDialogClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: theme.shadows[12]
                    }
                }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    pb: 1,
                    borderBottom: `1px solid ${theme.palette.divider}`
                }}>
                    {DialogIcon && (
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            bgcolor: theme.palette.primary.main,
                            color: '#fff'
                        }}>
                            <DialogIcon size={28} />
                        </Box>
                    )}
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold">
                            {dialogData?.title}
                        </Typography>
                    </Box>
                    <IconButton onClick={handleDialogClose} size="small">
                        <IconX size={20} />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {dialogData?.isCompanySelection ? (
                        <Box>
                            <Box marginBottom={3}>
                                <Typography variant="h6" p={1}>
                                    Şirket Seçiniz
                                </Typography>
                                <CompanyBoxAutocomplete
                                    onSelectId={(selectedId) => setSelectedId(selectedId)}
                                    onSelectAdi={(selectedAdi) => setSelectedAdi(selectedAdi)}
                                    onSelectDenetimTuru={(selectedDenetimTuru) =>
                                        setSelectedDenetimTuru(selectedDenetimTuru)
                                    }
                                    onSelectBobimi={(selectedBobimi) =>
                                        setSelectedBobimi(selectedBobimi)
                                    }
                                    onSelectTfrsmi={(selectedTfrsmi) =>
                                        setSelectedTfrsmi(selectedTfrsmi)
                                    }
                                    onSelectEnflasyonmu={(selectedEnflasyonmu) =>
                                        setSelectedEnflasyonmu(selectedEnflasyonmu)
                                    }
                                    onSelectKonsolidemi={(selectedKonsolidemi) =>
                                        setSelectedKonsolidemi(selectedKonsolidemi)
                                    }
                                />
                            </Box>
                            <Box marginBottom={3}>
                                <Typography variant="h6" p={1}>
                                    Yıl Seçiniz
                                </Typography>
                                <YearBoxAutocomplete
                                    onSelect={(selectedYear) => setSelectedYear(selectedYear)}
                                    onSelectYear={(selectedYear) =>
                                        setSelectedYearNumber(selectedYear)
                                    }
                                    selectedDenetlenenId={selectedId}
                                />
                            </Box>
                        </Box>
                    ) : (
                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                            {dialogData?.description}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2.5, gap: 1 }}>
                    <Button onClick={handleDialogClose} color="inherit">
                        Kapat
                    </Button>
                    {dialogData?.isCompanySelection ? (
                        <Button
                            onClick={handleCompanySelect}
                            variant="contained"
                            color="primary"
                            disabled={!selectedId || !selectedYearNumber}
                        >
                            Şirket Seç
                        </Button>
                    ) : dialogData?.href ? (
                        <Button
                            onClick={handleNavigate}
                            variant="contained"
                            color="primary"
                            endIcon={<IconArrowRight size={18} />}
                        >
                            Sayfayı Aç
                        </Button>
                    ) : null}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default GuideFlow;
