import { uniqueId } from "lodash";

// Notifications dropdown

interface notificationType {
  avatar: string;
  title: string;
  subtitle: string;
}

const notifications: notificationType[] = [
  {
    avatar: "/images/profile/user-1.jpg",
    title: "Ahmet Uygulamaya Katıldı!",
    subtitle: "Tebrik et.",
  },
  /*{
    avatar: "/images/profile/user-2.jpg",
    title: "New message received",
    subtitle: "Salma sent you new message",
  },
  {
    avatar: "/images/profile/user-3.jpg",
    title: "New Payment received",
    subtitle: "Check your earnings",
  },
  {
    avatar: "/images/profile/user-4.jpg",
    title: "Jolly completed tasks",
    subtitle: "Assign her new tasks",
  },
  {
    avatar: "/images/profile/user-1.jpg",
    title: "Roman Joined the Team!",
    subtitle: "Congratulate him",
  },
  {
    avatar: "/images/profile/user-2.jpg",
    title: "New message received",
    subtitle: "Salma sent you new message",
  },
  {
    avatar: "/images/profile/user-3.jpg",
    title: "New Payment received",
    subtitle: "Check your earnings",
  },
  {
    avatar: "/images/profile/user-4.jpg",
    title: "Jolly completed tasks",
    subtitle: "Assign her new tasks",
  },*/
];

//
// Profile dropdown
//
interface ProfileType {
  [x: string]: any;
  id?: string;
  href: string;
  title: string;
  subtitle?: string;
  icon: any;
  children?: ProfileType[];
}
const profile: ProfileType[] = [
  {
    id: uniqueId(),
    href: "/apps/user-profile/profile",
    title: "Profilim",
    subtitle: "Hesap bilgileri",
    icon: "/images/svgs/icon-account.svg",
  },
  /*{
    id: uniqueId(),
    href: "/apps/email",
    title: "My Inbox",
    subtitle: "Messages & Emails",
    icon: "/images/svgs/icon-inbox.svg",
  },
  {
    id: uniqueId(),
    href: "/apps/notes",
    title: "My Tasks",
    subtitle: "To-do and Daily Tasks",
    icon: "/images/svgs/icon-tasks.svg",
  },*/
  {
    id: uniqueId(),
    title: "Kullanıcı",
    icon: "/images/svgs/icon-users2.png",
    href: "/Kullanici",
    subtitle: "Kullanıcılar ile ilgili işlemler",
    personal: true,
    /*children: [
      {
        id: uniqueId(),
        title: "Kullanıcı İşlemleri",
        icon: "/images/svgs/icon-dot.svg",
        href: "/Kullanici/KullaniciIslemleri",
      },
      {
        id: uniqueId(),
        title: "Kullanıcı Sözleşme Saatleri",
        icon: "/images/svgs/icon-dot.svg",
        href: "/Kullanici/KullaniciSozlesmeSaatleri",
      },
      {
        id: uniqueId(),
        title: "Denetçi Yıllık Taahütname",
        icon: "/images/svgs/icon-dot.svg",
        href: "/Kullanici/DenetciYillikTaahutname",
      },
      {
        id: uniqueId(),
        title: "Sürekli Eğitim Belge ve Bilgileri",
        icon: "/images/svgs/icon-dot.svg",
        href: "/Kullanici/SurekliEgitimBelgeVeBilgileri",
      },
      {
        id: uniqueId(),
        title: "Denetçi Puantaj Belgesi",
        icon: "/images/svgs/icon-dot.svg",
        href: "/Kullanici/DenetciPuantajBelgesi",
      },
    ],*/
  },
  {
    id: uniqueId(),
    title: "Tema Ayarları",
    icon: "/images/svgs/icon-settings2.png",
    href: "/TemaAyarlari",
    subtitle: "Tema kişiselleştirme",
  },
];

// apps dropdown

interface appsLinkType {
  href: string;
  title: string;
  subtext: string;
  avatar: string;
}

const appsLink: appsLinkType[] = [
  {
    href: "/apps/chats",
    title: "Chat Application",
    subtext: "New messages arrived",
    avatar: "/images/svgs/icon-dd-chat.svg",
  },
  {
    href: "/apps/ecommerce/shop",
    title: "eCommerce App",
    subtext: "New stock available",
    avatar: "/images/svgs/icon-dd-cart.svg",
  },
  {
    href: "/apps/notes",
    title: "Notes App",
    subtext: "To-do and Daily tasks",
    avatar: "/images/svgs/icon-dd-invoice.svg",
  },
  {
    href: "/apps/calendar",
    title: "Calendar App",
    subtext: "Get dates",
    avatar: "/images/svgs/icon-dd-date.svg",
  },
  {
    href: "/apps/contacts",
    title: "Contact Application",
    subtext: "2 Unsaved Contacts",
    avatar: "/images/svgs/icon-dd-mobile.svg",
  },
  {
    href: "/apps/tickets",
    title: "Tickets App",
    subtext: "Submit tickets",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
  {
    href: "/apps/email",
    title: "Email App",
    subtext: "Get new emails",
    avatar: "/images/svgs/icon-dd-message-box.svg",
  },
  {
    href: "/apps/blog/post",
    title: "Blog App",
    subtext: "added new blog",
    avatar: "/images/svgs/icon-dd-application.svg",
  },
];

interface LinkType {
  href: string;
  title: string;
}

const pageLinks: LinkType[] = [
  {
    href: "/theme-pages/pricing",
    title: "Pricing Page",
  },
  {
    href: "/auth/auth1/login",
    title: "Authentication Design",
  },
  {
    href: "/auth/auth1/register",
    title: "Register Now",
  },
  {
    href: "/404",
    title: "404 Error Page",
  },
  {
    href: "/apps/note",
    title: "Notes App",
  },
  {
    href: "/apps/user-profile/profile",
    title: "User Application",
  },
  {
    href: "/apps/blog/post",
    title: "Blog Design",
  },
  {
    href: "/apps/ecommerce/checkout",
    title: "Shopping Cart",
  },
];

interface VeriLinkType {
  href: string;
  title: string;
  subtext: string;
  avatar: string;
}

const veriLink: VeriLinkType[] = [
  {
    href: "/",
    title: "Finansal Veri Aktarma",
    subtext: "Veri",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
  {
    href: "/",
    title: "Mizanlar",
    subtext: "Veri",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
  /*{
    href: "/",
    title: "Vuk Excel Mizan",
    subtext: "Veri",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
  {
    href: "/",
    title: "E-Defter Mizan",
    subtext: "Veri",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
  {
    href: "/",
    title: "Yevmiye Mizan",
    subtext: "Veri",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },*/
  {
    href: "/",
    title: "Yabancı Para Hesap Listesi",
    subtext: "Veri",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
  {
    href: "/",
    title: "Kurumlar Beyannamesi Karşılaştırma",
    subtext: "Veri",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
  {
    href: "/",
    title: "E-Defter ve Yevmiye İnceleme",
    subtext: "Veri",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
  /*/{
    href: "/",
    title: "E-Defter İnceleme",
    subtext: "Veri",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
  {
    href: "/",
    title: "Yevmiye İnceleme",
    subtext: "Veri",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },*/
];

interface HesaplamalarLinkType {
  href: string;
  title: string;
  subtext: string;
  avatar: string;
}

const hesaplamalarLink: HesaplamalarLinkType[] = [
  {
    href: "/",
    title: "Veri Girişi",
    subtext: "Hesaplamalar",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
  {
    href: "/",
    title: "Yaşlandırma",
    subtext: "Hesaplamalar",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
  {
    href: "/",
    title: "Beklenen Kredi Zararı",
    subtext: "Hesaplamalar",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
  {
    href: "/",
    title: "Reeskont",
    subtext: "Hesaplamalar",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
  {
    href: "/",
    title: "Dava Karşılıkları",
    subtext: "Hesaplamalar",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
  {
    href: "/",
    title: "Ertelenmiş Vergi Hesabı",
    subtext: "Hesaplamalar",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
  {
    href: "/",
    title: "İç Verim Oranı",
    subtext: "Hesaplamalar",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
  {
    href: "/",
    title: "Zımni Faiz",
    subtext: "Hesaplamalar",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
  {
    href: "/",
    title: "İlişkili Taraf Sınıflama",
    subtext: "Hesaplamalar",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
  {
    href: "/",
    title: "Vadeli Banka Mevduatı",
    subtext: "Hesaplamalar",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
  {
    href: "/",
    title: "Vadeli Banka Mevduatı Faiz Tahakkuk Hesaplama",
    subtext: "Hesaplamalar",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
  {
    href: "/",
    title: "Hareketli-Hareketsiz Fişler",
    subtext: "Hesaplamalar",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
  {
    href: "/",
    title: "Hareketsiz Stoklar",
    subtext: "Hesaplamalar",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
  {
    href: "/",
    title: "Geçmiş Yıllar Kar Zarar Kontrolleri",
    subtext: "Hesaplamalar",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
  {
    href: "/",
    title: "Kur Farkı Kayıtları",
    subtext: "Hesaplamalar",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
];

interface DonusumLinkType {
  href: string;
  title: string;
  subtext: string;
  avatar: string;
}

const donusumLink: DonusumLinkType[] = [
  {
    href: "/",
    title: "Fiş Girişi",
    subtext: "Dönüşüm",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
  {
    href: "/",
    title: "Fiş İşlemleri",
    subtext: "Dönüşüm",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
  {
    href: "/",
    title: "Açılış Fiş Oluşturma",
    subtext: "Dönüşüm",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
  {
    href: "/",
    title: "Hazır Fişler",
    subtext: "Dönüşüm",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
  {
    href: "/",
    title: "Dönüşüm",
    subtext: "Dönüşüm",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
  {
    href: "/",
    title: "Belirleme Belgesi",
    subtext: "Dönüşüm",
    avatar: "/images/svgs/icon-dd-lifebuoy.svg",
  },
];
export {
  notifications,
  profile,
  pageLinks,
  appsLink,
  veriLink,
  hesaplamalarLink,
  donusumLink,
};
