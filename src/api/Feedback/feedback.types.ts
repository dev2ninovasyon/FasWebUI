export type FeedbackSentiment = 1 | 2 | 3 | 4 | 5;

export type FeedbackType =
  | "KullanimKolayligi"
  | "GorselTasarim"
  | "HizPerformans"
  | "VeriDogrulugu"
  | "EksikOzellik"
  | "HataBug"
  | "Oneri"
  | "Diger";

export type FeedbackStatus =
  | "Yeni"
  | "Inceleniyor"
  | "Cozuldu"
  | "Kapatildi"
  | "YanitaIhtiyacVar";

export type ColorVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral";

export interface FeedbackCreateRequest {
  pageKey: string;
  pageTitle?: string;
  route?: string;
  moduleKey?: string;
  sentiment: FeedbackSentiment;
  feedbackType?: FeedbackType;
  comment?: string;
  wantsContact: boolean;
  browserInfo?: string;
  appVersion?: string;
  queryContext?: string;
}

export interface FeedbackResponse {
  id: number;
  userId?: number;
  userName?: string;
  pageKey: string;
  pageTitle?: string;
  route?: string;
  moduleKey?: string;
  sentiment: FeedbackSentiment;
  feedbackType?: FeedbackType;
  comment?: string;
  wantsContact: boolean;
  status: FeedbackStatus;
  adminNote?: string;
  browserInfo?: string;
  appVersion?: string;
  queryContext?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackPageStats {
  pageKey: string;
  totalCount: number;
  averageSentiment: number;
  sentimentDistribution: Record<string, number>;
  mostCommonFeedbackType?: FeedbackType;
  currentUserHasFeedback?: boolean;
  currentUserSentiment?: FeedbackSentiment;
}

export interface FeedbackAdminFilter {
  pageKey?: string;
  route?: string;
  moduleKey?: string;
  feedbackType?: FeedbackType;
  sentiment?: FeedbackSentiment;
  status?: FeedbackStatus;
  userId?: number;
  dateFrom?: string;
  dateTo?: string;
  wantsContact?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TopPageDto {
  pageKey: string;
  pageTitle?: string;
  count: number;
  averageSentiment: number;
}

export interface FeedbackAdminSummary {
  totalCount: number;
  last7DaysCount: number;
  unreviewedCount: number;
  averageSentiment: number;
  sentimentDistribution: Record<string, number>;
  topPages: TopPageDto[];
}

export interface SentimentOption {
  value: FeedbackSentiment;
  label: string;
  emoji: string;
  colorVariant: ColorVariant;
}

export interface FeedbackTypeOption {
  value: FeedbackType;
  label: string;
}

export const SENTIMENT_OPTIONS: SentimentOption[] = [
  { value: 5, label: "Memnun", emoji: "😊", colorVariant: "success" },
  { value: 3, label: "Nötr", emoji: "😐", colorVariant: "neutral" },
  { value: 1, label: "Memnun Değil", emoji: "☹️", colorVariant: "error" },
];

export const FEEDBACK_TYPE_OPTIONS: FeedbackTypeOption[] = [
  { value: "KullanimKolayligi", label: "Kullanım Kolaylığı" },
  { value: "GorselTasarim", label: "Görsel Tasarım" },
  { value: "HizPerformans", label: "Hız / Performans" },
  { value: "VeriDogrulugu", label: "Veri Doğruluğu" },
  { value: "EksikOzellik", label: "Eksik Özellik" },
  { value: "HataBug", label: "Hata / Bug" },
  { value: "Oneri", label: "Öneri" },
  { value: "Diger", label: "Diğer" },
];

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  Yeni: "Yeni",
  Inceleniyor: "İnceleniyor",
  Cozuldu: "Çözüldü",
  Kapatildi: "Kapatıldı",
  YanitaIhtiyacVar: "Yanıta İhtiyaç Var",
};

export const FEEDBACK_STATUS_COLOR: Record<FeedbackStatus, ColorVariant> = {
  Yeni: "info",
  Inceleniyor: "warning",
  Cozuldu: "success",
  Kapatildi: "neutral",
  YanitaIhtiyacVar: "error",
};
