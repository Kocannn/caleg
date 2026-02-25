"use client";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  CircleMarker,
  Tooltip,
} from "react-leaflet";
import { Icon } from "leaflet";
import { useState } from "react";

interface PenerimaBantuan {
  id: number;
  nama: string;
  alamat: string;
  jenisBantuan: "SEMBAKO" | "UANG_CASH";
  lat: number;
  lng: number;
  kabupaten: string;
  kecamatan: string;
}

const dataDummy: PenerimaBantuan[] = [
  {
    id: 1,
    nama: "Ahmad Darmawan",
    alamat: "Jl. Diponegoro No. 45, Palu",
    jenisBantuan: "SEMBAKO",
    lat: -0.8917,
    lng: 119.8707,
    kabupaten: "Kota Palu",
    kecamatan: "Palu Barat",
  },
  {
    id: 2,
    nama: "Siti Nurhaliza",
    alamat: "Jl. Ahmad Yani No. 12, Palu",
    jenisBantuan: "UANG_CASH",
    lat: -0.8832,
    lng: 119.8542,
    kabupaten: "Kota Palu",
    kecamatan: "Palu Timur",
  },
  {
    id: 3,
    nama: "Budi Santoso",
    alamat: "Jl. Raden Saleh No. 78, Palu",
    jenisBantuan: "SEMBAKO",
    lat: -0.9025,
    lng: 119.8891,
    kabupaten: "Kota Palu",
    kecamatan: "Palu Selatan",
  },
  {
    id: 4,
    nama: "Fatimah Az-Zahra",
    alamat: "Jl. Veteran No. 23, Donggala",
    jenisBantuan: "SEMBAKO",
    lat: -0.4247,
    lng: 119.7442,
    kabupaten: "Donggala",
    kecamatan: "Banawa",
  },
  {
    id: 5,
    nama: "Muhammad Rizki",
    alamat: "Jl. Poros Palu No. 56, Sigi",
    jenisBantuan: "UANG_CASH",
    lat: -1.1234,
    lng: 119.9567,
    kabupaten: "Sigi",
    kecamatan: "Biromaru",
  },
  {
    id: 6,
    nama: "Nurul Hidayah",
    alamat: "Jl. Laskar Hitam No. 89, Palu",
    jenisBantuan: "SEMBAKO",
    lat: -0.8756,
    lng: 119.8623,
    kabupaten: "Kota Palu",
    kecamatan: "Palu Utara",
  },
  {
    id: 7,
    nama: "Andi Wijaya",
    alamat: "Jl. Tambu No. 34, Parigi Moutong",
    jenisBantuan: "UANG_CASH",
    lat: -0.8345,
    lng: 120.0123,
    kabupaten: "Parigi Moutong",
    kecamatan: "Parigi",
  },
  {
    id: 8,
    nama: "Rina Kusumawati",
    alamat: "Jl. Soekarno Hatta No. 67, Palu",
    jenisBantuan: "SEMBAKO",
    lat: -0.8978,
    lng: 119.8456,
    kabupaten: "Kota Palu",
    kecamatan: "Tawaeli",
  },
  {
    id: 9,
    nama: "Hasan Abdullah",
    alamat: "Jl. Basuki Rahmat No. 91, Tolitoli",
    jenisBantuan: "SEMBAKO",
    lat: 1.0876,
    lng: 120.7945,
    kabupaten: "Tolitoli",
    kecamatan: "Baolan",
  },
  {
    id: 10,
    nama: "Dewi Sartika",
    alamat: "Jl. Gatot Subroto No. 15, Buol",
    jenisBantuan: "UANG_CASH",
    lat: 1.1234,
    lng: 121.3456,
    kabupaten: "Buol",
    kecamatan: "Buol",
  },
  {
    id: 11,
    nama: "Rahmat Hidayat",
    alamat: "Jl. Merdeka No. 28, Donggala",
    jenisBantuan: "UANG_CASH",
    lat: -0.4356,
    lng: 119.7589,
    kabupaten: "Donggala",
    kecamatan: "Labuan",
  },
  {
    id: 12,
    nama: "Aisyah Putri",
    alamat: "Jl. Pahlawan No. 52, Sigi",
    jenisBantuan: "SEMBAKO",
    lat: -1.1567,
    lng: 119.9234,
    kabupaten: "Sigi",
    kecamatan: "Palolo",
  },
];

// Icon untuk Sembako (biru)
const sembakoIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Icon untuk Uang Cash (kuning/merah)
const uangCashIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Koordinat center untuk setiap kabupaten/kota di Sulawesi Tengah
const kabupatenCoordinates: Record<string, [number, number]> = {
  "Kota Palu": [-0.8917, 119.8707],
  Donggala: [-0.4247, 119.7442],
  Sigi: [-1.1234, 119.9567],
  "Parigi Moutong": [-0.8345, 120.0123],
  Tolitoli: [1.0876, 120.7945],
  Buol: [1.1234, 121.3456],
};

export default function SebaranWilayahClient() {
  const [expandedKabupaten, setExpandedKabupaten] = useState<string | null>(
    null,
  );
  const [expandedKecamatan, setExpandedKecamatan] = useState<string | null>(
    null,
  );

  const sembakoCount = dataDummy.filter(
    (d) => d.jenisBantuan === "SEMBAKO",
  ).length;
  const uangCashCount = dataDummy.filter(
    (d) => d.jenisBantuan === "UANG_CASH",
  ).length;

  // Grouping data by kabupaten and kecamatan
  const groupedData = dataDummy.reduce(
    (acc, item) => {
      if (!acc[item.kabupaten]) {
        acc[item.kabupaten] = {};
      }
      if (!acc[item.kabupaten][item.kecamatan]) {
        acc[item.kabupaten][item.kecamatan] = [];
      }
      acc[item.kabupaten][item.kecamatan].push(item);
      return acc;
    },
    {} as Record<string, Record<string, PenerimaBantuan[]>>,
  );

  const toggleKabupaten = (kab: string) => {
    setExpandedKabupaten(expandedKabupaten === kab ? null : kab);
    setExpandedKecamatan(null);
  };

  const toggleKecamatan = (kec: string) => {
    setExpandedKecamatan(expandedKecamatan === kec ? null : kec);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Data Sebaran Wilayah Penerima Bantuan
        </h1>
        <p className="text-gray-600">
          Peta sebaran penerima bantuan sembako dan uang cash di Sulawesi Tengah
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Penerima</p>
              <p className="text-2xl font-bold text-gray-900">
                {dataDummy.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Penerima Sembako</p>
              <p className="text-2xl font-bold text-gray-900">{sembakoCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Penerima Uang Cash</p>
              <p className="text-2xl font-bold text-gray-900">
                {uangCashCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Peta Sebaran
          </h2>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <img
                src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png"
                alt="Sembako"
                className="w-5 h-5"
              />
              <span className="text-gray-600">Sembako</span>
            </div>
            <div className="flex items-center gap-2">
              <img
                src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png"
                alt="Uang Cash"
                className="w-5 h-5"
              />
              <span className="text-gray-600">Uang Cash</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full border-2 border-blue-500 bg-blue-500 bg-opacity-20"></div>
              <span className="text-gray-600">Grouping Kab/Kota</span>
            </div>
          </div>
        </div>

        <div className="h-150 w-full rounded-lg overflow-hidden border border-gray-200">
          <MapContainer
            center={[-1.43, 121.4456]}
            zoom={8}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Circle Marker untuk grouping per Kabupaten/Kota */}
            {Object.entries(groupedData).map(([kabupaten, kecamatans]) => {
              const totalPenerima = Object.values(kecamatans).flat().length;
              const center = kabupatenCoordinates[kabupaten] || [
                -1.43, 121.4456,
              ];
              const sembako = Object.values(kecamatans)
                .flat()
                .filter((p) => p.jenisBantuan === "SEMBAKO").length;
              const cash = Object.values(kecamatans)
                .flat()
                .filter((p) => p.jenisBantuan === "UANG_CASH").length;

              return (
                <CircleMarker
                  key={`circle-${kabupaten}`}
                  center={center}
                  radius={Math.max(20, totalPenerima * 8)}
                  pathOptions={{
                    color: "#3b82f6",
                    fillColor: "#3b82f6",
                    fillOpacity: 0.2,
                    weight: 2,
                  }}
                >
                  <Tooltip
                    direction="top"
                    permanent={false}
                    className="text-sm"
                  >
                    <div className="text-center">
                      <p className="font-semibold">{kabupaten}</p>
                      <p className="text-xs text-gray-600">
                        Total: {totalPenerima}
                      </p>
                      <p className="text-xs text-blue-600">
                        Sembako: {sembako}
                      </p>
                      <p className="text-xs text-red-600">Cash: {cash}</p>
                    </div>
                  </Tooltip>
                </CircleMarker>
              );
            })}

            {/* Marker individual untuk setiap penerima */}
            {dataDummy.map((penerima) => (
              <Marker
                key={penerima.id}
                position={[penerima.lat, penerima.lng]}
                icon={
                  penerima.jenisBantuan === "SEMBAKO"
                    ? sembakoIcon
                    : uangCashIcon
                }
              >
                <Popup>
                  <div className="min-w-50">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {penerima.nama}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">
                        <span className="font-medium">Alamat:</span>{" "}
                        {penerima.alamat}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Kab/Kota:</span>{" "}
                        {penerima.kabupaten}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Kecamatan:</span>{" "}
                        {penerima.kecamatan}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Jenis Bantuan:</span>{" "}
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            penerima.jenisBantuan === "SEMBAKO"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {penerima.jenisBantuan === "SEMBAKO"
                            ? "Sembako"
                            : "Uang Cash"}
                        </span>
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Daftar Penerima Bantuan per Wilayah
        </h2>
        <div className="space-y-2">
          {Object.entries(groupedData).map(([kabupaten, kecamatans]) => {
            const totalSembako = Object.values(kecamatans)
              .flat()
              .filter((p) => p.jenisBantuan === "SEMBAKO").length;
            const totalUangCash = Object.values(kecamatans)
              .flat()
              .filter((p) => p.jenisBantuan === "UANG_CASH").length;
            const isExpanded = expandedKabupaten === kabupaten;

            return (
              <div
                key={kabupaten}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleKabupaten(kabupaten)}
                  className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    <span className="font-semibold text-gray-900">
                      {kabupaten}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({Object.values(kecamatans).flat().length} penerima)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      Sembako: {totalSembako}
                    </span>
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                      Cash: {totalUangCash}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-200">
                    {Object.entries(kecamatans).map(
                      ([kecamatan, penerimaList]) => {
                        const kecSembako = penerimaList.filter(
                          (p) => p.jenisBantuan === "SEMBAKO",
                        ).length;
                        const kecUangCash = penerimaList.filter(
                          (p) => p.jenisBantuan === "UANG_CASH",
                        ).length;
                        const isKecExpanded = expandedKecamatan === kecamatan;

                        return (
                          <div key={kecamatan}>
                            <button
                              onClick={() => toggleKecamatan(kecamatan)}
                              className="w-full px-4 py-2.5 bg-white hover:bg-gray-50 flex items-center justify-between transition-colors border-l-4 border-l-transparent hover:border-l-blue-500"
                            >
                              <div className="flex items-center gap-3 pl-4">
                                <svg
                                  className={`w-4 h-4 text-gray-400 transition-transform ${isKecExpanded ? "rotate-90" : ""}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                                <span className="text-gray-700">
                                  {kecamatan}
                                </span>
                                <span className="text-xs text-gray-400">
                                  ({penerimaList.length})
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-blue-600 font-medium">
                                  {kecSembako}
                                </span>
                                <span className="text-xs text-red-600 font-medium">
                                  {kecUangCash}
                                </span>
                              </div>
                            </button>

                            {isKecExpanded && (
                              <div className="border-t border-gray-100 bg-gray-50">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-gray-200">
                                      <th className="pb-2 text-left font-semibold text-gray-600 px-4 py-2">
                                        Nama
                                      </th>
                                      <th className="pb-2 text-left font-semibold text-gray-600 px-4 py-2">
                                        Alamat
                                      </th>
                                      <th className="pb-2 text-left font-semibold text-gray-600 px-4 py-2">
                                        Jenis Bantuan
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {penerimaList.map((penerima) => (
                                      <tr
                                        key={penerima.id}
                                        className="hover:bg-white"
                                      >
                                        <td className="py-2.5 px-4 font-medium text-gray-900">
                                          {penerima.nama}
                                        </td>
                                        <td className="py-2.5 px-4 text-gray-600">
                                          {penerima.alamat}
                                        </td>
                                        <td className="py-2.5 px-4">
                                          <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                              penerima.jenisBantuan ===
                                              "SEMBAKO"
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-red-100 text-red-700"
                                            }`}
                                          >
                                            {penerima.jenisBantuan === "SEMBAKO"
                                              ? "Sembako"
                                              : "Uang Cash"}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        );
                      },
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
