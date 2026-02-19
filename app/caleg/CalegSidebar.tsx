"use client";

import Sidebar from "@/components/Sidebar";

const navItems = [
  { label: "Dashboard", href: "/caleg", icon: "home" },
  { label: "Data Pendukung", href: "/caleg/pendukung", icon: "clipboard" },
  { label: "Peta Sebaran", href: "/caleg/peta", icon: "map" },
  { label: "Hasil Survey", href: "/caleg/survey", icon: "chart" },
];

export default function CalegSidebar() {
  return <Sidebar navItems={navItems} role="Caleg" roleColor="bg-indigo-600" />;
}
