"use client";

import Sidebar from "@/components/Sidebar";

const navItems = [
  { label: "Dashboard", href: "/koordinator", icon: "home" },
  { label: "Kelola Relawan", href: "/koordinator/relawan", icon: "users" },
  { label: "Data Pendukung", href: "/koordinator/pendukung", icon: "clipboard" },
  { label: "Monitoring Kinerja", href: "/koordinator/monitoring", icon: "chart" },
];

export default function KoordinatorSidebar() {
  return <Sidebar navItems={navItems} role="Koordinator" roleColor="bg-green-600" />;
}
