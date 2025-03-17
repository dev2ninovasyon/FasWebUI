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

// Profile dropdown

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
    title: "Hesap Ayarları",
    icon: "/images/svgs/icon-settings.png",
    href: "/HesapAyarlari",
    subtitle: "Hesap kişiselleştirme",
  },
  {
    id: uniqueId(),
    title: "Tema Ayarları",
    icon: "/images/svgs/icon-settings2.png",
    href: "/TemaAyarlari",
    subtitle: "Tema kişiselleştirme",
  },
  {
    id: uniqueId(),
    title: "Kullanıcı",
    icon: "/images/svgs/icon-users2.png",
    href: "/Kullanici",
    subtitle: "Kullanıcılar ile ilgili işlemler",
    personal: true,
  },
];

export { notifications, profile };
