export interface DeviceModelEntry {
  model: string
  release_year: number
  end_year?: number      // undefined = still in production
  processors?: string[]  // if defined, only these chips are valid for this model
}

export interface BrandEntry {
  brand: string
  models: DeviceModelEntry[]
}

export type DeviceCategory = 'laptop' | 'smartphone' | 'tablet' | 'desktop'

export const DEVICE_CATALOG: Record<DeviceCategory, BrandEntry[]> = {
  laptop: [
    {
      brand: 'Apple',
      models: [
        { model: 'MacBook Air (M1, 2020)',         release_year: 2020, end_year: 2022, processors: ['Apple M1'] },
        { model: 'MacBook Air (M2, 2022)',         release_year: 2022, end_year: 2024, processors: ['Apple M2'] },
        { model: 'MacBook Air (M3, 2024)',         release_year: 2024,                processors: ['Apple M3'] },
        { model: 'MacBook Air (M4, 2025)',         release_year: 2025,                processors: ['Apple M4'] },
        { model: 'MacBook Pro 13" (M1, 2020)',     release_year: 2020, end_year: 2022, processors: ['Apple M1'] },
        { model: 'MacBook Pro 13" (M2, 2022)',     release_year: 2022, end_year: 2023, processors: ['Apple M2'] },
        { model: 'MacBook Pro 14" (M1 Pro, 2021)', release_year: 2021, end_year: 2023, processors: ['Apple M1 Pro', 'Apple M1 Max'] },
        { model: 'MacBook Pro 14" (M3, 2023)',     release_year: 2023,                processors: ['Apple M3', 'Apple M3 Pro'] },
        { model: 'MacBook Pro 14" (M4, 2024)',     release_year: 2024,                processors: ['Apple M4', 'Apple M4 Pro'] },
        { model: 'MacBook Pro 16" (M1 Pro, 2021)', release_year: 2021, end_year: 2023, processors: ['Apple M1 Pro', 'Apple M1 Max'] },
        { model: 'MacBook Pro 16" (M3, 2023)',     release_year: 2023,                processors: ['Apple M3 Pro', 'Apple M3 Max'] },
        { model: 'MacBook Pro 16" (M4, 2024)',     release_year: 2024,                processors: ['Apple M4 Pro', 'Apple M4 Max'] },
      ],
    },
    {
      brand: 'Lenovo',
      models: [
        { model: 'IdeaPad 3 15"',            release_year: 2020 },
        { model: 'IdeaPad 5 15"',            release_year: 2020 },
        { model: 'IdeaPad Slim 5i Gen 8',    release_year: 2023 },
        { model: 'IdeaPad Slim 5i Gen 9',    release_year: 2024 },
        { model: 'IdeaPad Gaming 3 15"',     release_year: 2021 },
        { model: 'Legion 5 15" Gen 6',       release_year: 2021 },
        { model: 'Legion 5 15" Gen 7',       release_year: 2022 },
        { model: 'Legion 5 15" Gen 8',       release_year: 2023 },
        { model: 'Legion 5 Pro 16" Gen 7',   release_year: 2022 },
        { model: 'Legion 5 Pro 16" Gen 8',   release_year: 2023 },
        { model: 'Legion 7i 16" Gen 8',      release_year: 2023 },
        { model: 'ThinkPad E14 Gen 4',       release_year: 2022 },
        { model: 'ThinkPad E14 Gen 5',       release_year: 2023 },
        { model: 'ThinkPad E16 Gen 1',       release_year: 2023 },
        { model: 'ThinkPad X1 Carbon Gen 10', release_year: 2022 },
        { model: 'ThinkPad X1 Carbon Gen 11', release_year: 2023 },
        { model: 'ThinkPad X1 Carbon Gen 12', release_year: 2024 },
        { model: 'Yoga 7i Gen 8',            release_year: 2023 },
        { model: 'Yoga Slim 7i Gen 8',       release_year: 2023 },
      ],
    },
    {
      brand: 'Dell',
      models: [
        { model: 'XPS 13 9310',              release_year: 2020, end_year: 2022 },
        { model: 'XPS 13 9315',              release_year: 2022, end_year: 2023 },
        { model: 'XPS 13 Plus 9320',         release_year: 2022 },
        { model: 'XPS 15 9510',              release_year: 2021, end_year: 2022 },
        { model: 'XPS 15 9520',              release_year: 2022, end_year: 2023 },
        { model: 'XPS 15 9530',              release_year: 2023 },
        { model: 'Inspiron 14 5420',         release_year: 2022 },
        { model: 'Inspiron 15 3520',         release_year: 2022 },
        { model: 'Inspiron 15 5510',         release_year: 2021, end_year: 2022 },
        { model: 'G15 5510',                 release_year: 2021, end_year: 2022 },
        { model: 'G15 5520',                 release_year: 2022, end_year: 2023 },
        { model: 'G15 5530',                 release_year: 2023 },
        { model: 'Latitude 5430',            release_year: 2022 },
        { model: 'Latitude 5440',            release_year: 2023 },
        { model: 'Vostro 3510',              release_year: 2021, end_year: 2023 },
      ],
    },
    {
      brand: 'HP',
      models: [
        { model: 'Pavilion 15-eg1000',       release_year: 2021, end_year: 2022 },
        { model: 'Pavilion 15-eg3000',       release_year: 2023 },
        { model: 'Pavilion 15-eg4000',       release_year: 2024 },
        { model: 'Envy x360 13-ay',          release_year: 2020, end_year: 2022 },
        { model: 'Envy x360 15-ew',          release_year: 2022 },
        { model: 'Envy x360 14-fc',          release_year: 2023 },
        { model: 'Spectre x360 14-ea',       release_year: 2021, end_year: 2022 },
        { model: 'Spectre x360 16-f',        release_year: 2022 },
        { model: 'Spectre x360 14-eu',       release_year: 2023 },
        { model: 'EliteBook 840 G8',         release_year: 2021, end_year: 2022 },
        { model: 'EliteBook 840 G9',         release_year: 2022, end_year: 2023 },
        { model: 'EliteBook 840 G10',        release_year: 2023 },
        { model: 'ProBook 440 G9',           release_year: 2022, end_year: 2023 },
        { model: 'ProBook 440 G10',          release_year: 2023 },
        { model: 'OMEN 16-b',               release_year: 2021 },
        { model: 'OMEN 16-n',               release_year: 2022 },
        { model: 'Victus 16-e',             release_year: 2021 },
        { model: 'Victus 15-fb',            release_year: 2022 },
      ],
    },
    {
      brand: 'Asus',
      models: [
        { model: 'ZenBook 14 UM425',         release_year: 2021, end_year: 2022 },
        { model: 'ZenBook 14X OLED UX5400',  release_year: 2022 },
        { model: 'ZenBook 14 OLED UX3405',   release_year: 2024 },
        { model: 'VivoBook 15 X1502',        release_year: 2022 },
        { model: 'VivoBook 15 X1504',        release_year: 2023 },
        { model: 'VivoBook 16X K3605',       release_year: 2023 },
        { model: 'ROG Strix G15 G513',       release_year: 2021 },
        { model: 'ROG Strix G16 G614',       release_year: 2023 },
        { model: 'ROG Zephyrus G14 GA402',   release_year: 2022 },
        { model: 'ROG Zephyrus G14 GA403',   release_year: 2024 },
        { model: 'TUF Gaming A15 FA506',     release_year: 2020 },
        { model: 'TUF Gaming A15 FA507',     release_year: 2022 },
        { model: 'TUF Gaming A16 FA617',     release_year: 2023 },
        { model: 'ExpertBook B1 B1500',      release_year: 2021 },
        { model: 'ExpertBook B5 B5604',      release_year: 2023 },
      ],
    },
    {
      brand: 'Acer',
      models: [
        { model: 'Aspire 5 A515-56',         release_year: 2021, end_year: 2022 },
        { model: 'Aspire 5 A515-57',         release_year: 2022, end_year: 2023 },
        { model: 'Aspire 5 A515-58',         release_year: 2023 },
        { model: 'Swift 3 SF314-512',        release_year: 2022, end_year: 2023 },
        { model: 'Swift Go 14 SFG14-71',     release_year: 2023 },
        { model: 'Swift X SFX14-51G',        release_year: 2022 },
        { model: 'Nitro 5 AN515-57',         release_year: 2021, end_year: 2022 },
        { model: 'Nitro 5 AN515-58',         release_year: 2022, end_year: 2023 },
        { model: 'Nitro V 15 ANV15-51',      release_year: 2023 },
        { model: 'Predator Helios 300 PH315-54', release_year: 2021, end_year: 2022 },
        { model: 'Predator Helios 300 PH315-55', release_year: 2022 },
        { model: 'Predator Helios Neo 16 PHN16-71', release_year: 2023 },
      ],
    },
    {
      brand: 'Samsung',
      models: [
        { model: 'Galaxy Book2 Pro 13"',     release_year: 2022, end_year: 2023 },
        { model: 'Galaxy Book2 Pro 15"',     release_year: 2022, end_year: 2023 },
        { model: 'Galaxy Book3 Pro 14"',     release_year: 2023 },
        { model: 'Galaxy Book3 Pro 16"',     release_year: 2023 },
        { model: 'Galaxy Book3 Pro 360 16"', release_year: 2023 },
        { model: 'Galaxy Book4 Pro 14"',     release_year: 2024 },
        { model: 'Galaxy Book4 Pro 16"',     release_year: 2024 },
        { model: 'Galaxy Book2 360 13"',     release_year: 2022 },
        { model: 'Galaxy Book4 360 16"',     release_year: 2024 },
      ],
    },
    {
      brand: 'Huawei',
      models: [
        { model: 'MateBook D14 2022',        release_year: 2022 },
        { model: 'MateBook D14 2024',        release_year: 2024 },
        { model: 'MateBook D15 2021',        release_year: 2021, end_year: 2022 },
        { model: 'MateBook 14s',             release_year: 2021 },
        { model: 'MateBook X Pro 2022',      release_year: 2022 },
        { model: 'MateBook X Pro 2023',      release_year: 2023 },
        { model: 'MateBook 16s',             release_year: 2022 },
      ],
    },
    {
      brand: 'MSI',
      models: [
        { model: 'GF65 Thin 10U',            release_year: 2020, end_year: 2022 },
        { model: 'Katana GF66 12U',          release_year: 2022, end_year: 2023 },
        { model: 'Katana 15 B13V',           release_year: 2023 },
        { model: 'Prestige 14 A11M',         release_year: 2021, end_year: 2022 },
        { model: 'Modern 15 B12M',           release_year: 2022, end_year: 2023 },
        { model: 'Raider GE78 HX',           release_year: 2023 },
        { model: 'Vector GP78 HX',           release_year: 2023 },
        { model: 'Titan GT77 HX',            release_year: 2022 },
      ],
    },
    {
      brand: 'Microsoft',
      models: [
        { model: 'Surface Laptop 4 13.5"',   release_year: 2021, end_year: 2022 },
        { model: 'Surface Laptop 5 13.5"',   release_year: 2022, end_year: 2023 },
        { model: 'Surface Laptop 5 15"',     release_year: 2022, end_year: 2023 },
        { model: 'Surface Laptop 6 13.5"',   release_year: 2024 },
        { model: 'Surface Laptop 6 15"',     release_year: 2024 },
        { model: 'Surface Pro 8',            release_year: 2021, end_year: 2022 },
        { model: 'Surface Pro 9 (Intel)',    release_year: 2022, end_year: 2024 },
        { model: 'Surface Pro 9 (SQ3)',      release_year: 2022, end_year: 2024 },
        { model: 'Surface Pro 10',           release_year: 2024 },
        { model: 'Surface Pro 11',           release_year: 2024 },
      ],
    },
  ],

  smartphone: [
    {
      brand: 'Apple',
      models: [
        { model: 'iPhone 11',               release_year: 2019, end_year: 2021, processors: ['Apple A13 Bionic'] },
        { model: 'iPhone 11 Pro',           release_year: 2019, end_year: 2021, processors: ['Apple A13 Bionic'] },
        { model: 'iPhone 11 Pro Max',       release_year: 2019, end_year: 2021, processors: ['Apple A13 Bionic'] },
        { model: 'iPhone SE (2da gen)',     release_year: 2020, end_year: 2022, processors: ['Apple A13 Bionic'] },
        { model: 'iPhone 12',              release_year: 2020, end_year: 2022, processors: ['Apple A14 Bionic'] },
        { model: 'iPhone 12 mini',         release_year: 2020, end_year: 2022, processors: ['Apple A14 Bionic'] },
        { model: 'iPhone 12 Pro',          release_year: 2020, end_year: 2022, processors: ['Apple A14 Bionic'] },
        { model: 'iPhone 12 Pro Max',      release_year: 2020, end_year: 2022, processors: ['Apple A14 Bionic'] },
        { model: 'iPhone 13',              release_year: 2021,                 processors: ['Apple A15 Bionic'] },
        { model: 'iPhone 13 mini',         release_year: 2021, end_year: 2023, processors: ['Apple A15 Bionic'] },
        { model: 'iPhone 13 Pro',          release_year: 2021, end_year: 2023, processors: ['Apple A15 Bionic'] },
        { model: 'iPhone 13 Pro Max',      release_year: 2021, end_year: 2023, processors: ['Apple A15 Bionic'] },
        { model: 'iPhone SE (3ra gen)',    release_year: 2022,                 processors: ['Apple A15 Bionic'] },
        { model: 'iPhone 14',              release_year: 2022,                 processors: ['Apple A15 Bionic'] },
        { model: 'iPhone 14 Plus',         release_year: 2022,                 processors: ['Apple A15 Bionic'] },
        { model: 'iPhone 14 Pro',          release_year: 2022, end_year: 2024, processors: ['Apple A16 Bionic'] },
        { model: 'iPhone 14 Pro Max',      release_year: 2022, end_year: 2024, processors: ['Apple A16 Bionic'] },
        { model: 'iPhone 15',              release_year: 2023,                 processors: ['Apple A16 Bionic'] },
        { model: 'iPhone 15 Plus',         release_year: 2023,                 processors: ['Apple A16 Bionic'] },
        { model: 'iPhone 15 Pro',          release_year: 2023, end_year: 2025, processors: ['Apple A17 Pro'] },
        { model: 'iPhone 15 Pro Max',      release_year: 2023, end_year: 2025, processors: ['Apple A17 Pro'] },
        { model: 'iPhone 16',              release_year: 2024,                 processors: ['Apple A18'] },
        { model: 'iPhone 16 Plus',         release_year: 2024,                 processors: ['Apple A18'] },
        { model: 'iPhone 16 Pro',          release_year: 2024,                 processors: ['Apple A18 Pro'] },
        { model: 'iPhone 16 Pro Max',      release_year: 2024,                 processors: ['Apple A18 Pro'] },
        { model: 'iPhone 16e',             release_year: 2025,                 processors: ['Apple A16 Bionic'] },
      ],
    },
    {
      brand: 'Samsung',
      models: [
        // Note (fin de línea, chip según región)
        { model: 'Galaxy Note 20',         release_year: 2020, end_year: 2022, processors: ['Snapdragon 865+', 'Exynos 990'] },
        { model: 'Galaxy Note 20 Ultra',   release_year: 2020, end_year: 2022, processors: ['Snapdragon 865+', 'Exynos 990'] },
        // S20 FE
        { model: 'Galaxy S20 FE',          release_year: 2020, end_year: 2023, processors: ['Snapdragon 865', 'Exynos 990'] },
        // S21 — Snapdragon en LatAm, Exynos en Europa/Asia
        { model: 'Galaxy S21',             release_year: 2021, end_year: 2023, processors: ['Snapdragon 888', 'Exynos 2100'] },
        { model: 'Galaxy S21+',            release_year: 2021, end_year: 2023, processors: ['Snapdragon 888', 'Exynos 2100'] },
        { model: 'Galaxy S21 Ultra',       release_year: 2021, end_year: 2023, processors: ['Snapdragon 888', 'Exynos 2100'] },
        { model: 'Galaxy S21 FE',          release_year: 2022, end_year: 2023, processors: ['Snapdragon 888', 'Exynos 2100'] },
        // S22 — mismo esquema dual
        { model: 'Galaxy S22',             release_year: 2022, end_year: 2024, processors: ['Snapdragon 8 Gen 1', 'Exynos 2200'] },
        { model: 'Galaxy S22+',            release_year: 2022, end_year: 2024, processors: ['Snapdragon 8 Gen 1', 'Exynos 2200'] },
        { model: 'Galaxy S22 Ultra',       release_year: 2022, end_year: 2024, processors: ['Snapdragon 8 Gen 1', 'Exynos 2200'] },
        // S23 en adelante — solo Snapdragon (Samsung dejó Exynos en flagship)
        { model: 'Galaxy S23',             release_year: 2023, end_year: 2025, processors: ['Snapdragon 8 Gen 2'] },
        { model: 'Galaxy S23+',            release_year: 2023, end_year: 2025, processors: ['Snapdragon 8 Gen 2'] },
        { model: 'Galaxy S23 Ultra',       release_year: 2023, end_year: 2025, processors: ['Snapdragon 8 Gen 2'] },
        { model: 'Galaxy S23 FE',          release_year: 2023, end_year: 2025, processors: ['Snapdragon 8 Gen 1'] },
        { model: 'Galaxy S24',             release_year: 2024,                 processors: ['Snapdragon 8 Gen 3'] },
        { model: 'Galaxy S24+',            release_year: 2024,                 processors: ['Snapdragon 8 Gen 3'] },
        { model: 'Galaxy S24 Ultra',       release_year: 2024,                 processors: ['Snapdragon 8 Gen 3'] },
        { model: 'Galaxy S24 FE',          release_year: 2024,                 processors: ['Exynos 2500'] },
        { model: 'Galaxy S25',             release_year: 2025,                 processors: ['Snapdragon 8 Elite'] },
        { model: 'Galaxy S25+',            release_year: 2025,                 processors: ['Snapdragon 8 Elite'] },
        { model: 'Galaxy S25 Ultra',       release_year: 2025,                 processors: ['Snapdragon 8 Elite'] },
        // A-series (chips Exynos/MediaTek fijos por modelo)
        { model: 'Galaxy A52',             release_year: 2021, end_year: 2022, processors: ['Snapdragon 720G', 'Exynos 850'] },
        { model: 'Galaxy A53 5G',          release_year: 2022, end_year: 2024, processors: ['Exynos 1280'] },
        { model: 'Galaxy A54 5G',          release_year: 2023, end_year: 2025, processors: ['Exynos 1380'] },
        { model: 'Galaxy A55 5G',          release_year: 2024,                 processors: ['Exynos 1480'] },
        { model: 'Galaxy A34 5G',          release_year: 2023, end_year: 2024, processors: ['Dimensity 1080'] },
        { model: 'Galaxy A35 5G',          release_year: 2024,                 processors: ['Exynos 1380'] },
        { model: 'Galaxy A15 5G',          release_year: 2023,                 processors: ['Dimensity 6100+'] },
        // Z Fold / Flip — Snapdragon fijo
        { model: 'Galaxy Z Fold 4',        release_year: 2022, end_year: 2024, processors: ['Snapdragon 8+ Gen 1'] },
        { model: 'Galaxy Z Fold 5',        release_year: 2023, end_year: 2025, processors: ['Snapdragon 8 Gen 2'] },
        { model: 'Galaxy Z Fold 6',        release_year: 2024,                 processors: ['Snapdragon 8 Gen 3'] },
        { model: 'Galaxy Z Flip 4',        release_year: 2022, end_year: 2024, processors: ['Snapdragon 8+ Gen 1'] },
        { model: 'Galaxy Z Flip 5',        release_year: 2023, end_year: 2025, processors: ['Snapdragon 8 Gen 2'] },
        { model: 'Galaxy Z Flip 6',        release_year: 2024,                 processors: ['Snapdragon 8 Gen 3'] },
      ],
    },
    {
      brand: 'Xiaomi',
      models: [
        { model: 'Redmi Note 10',          release_year: 2021, end_year: 2022 },
        { model: 'Redmi Note 10 Pro',      release_year: 2021, end_year: 2022 },
        { model: 'Redmi Note 11',          release_year: 2021 },
        { model: 'Redmi Note 11 Pro',      release_year: 2022, end_year: 2023 },
        { model: 'Redmi Note 12',          release_year: 2022 },
        { model: 'Redmi Note 12 Pro',      release_year: 2022, end_year: 2023 },
        { model: 'Redmi Note 13',          release_year: 2023 },
        { model: 'Redmi Note 13 Pro',      release_year: 2023 },
        { model: 'Redmi Note 13 Pro+',     release_year: 2023 },
        { model: 'Redmi Note 14',          release_year: 2024 },
        { model: 'Redmi Note 14 Pro',      release_year: 2024 },
        { model: 'Redmi 12',               release_year: 2023 },
        { model: 'Redmi 13',               release_year: 2024 },
        { model: 'Xiaomi 12',              release_year: 2022, end_year: 2023, processors: ['Snapdragon 8 Gen 1'] },
        { model: 'Xiaomi 12 Pro',          release_year: 2022, end_year: 2023, processors: ['Snapdragon 8 Gen 1'] },
        { model: 'Xiaomi 12T',             release_year: 2022, end_year: 2023, processors: ['Dimensity 8100 Ultra'] },
        { model: 'Xiaomi 13',              release_year: 2022,                 processors: ['Snapdragon 8 Gen 2'] },
        { model: 'Xiaomi 13 Pro',          release_year: 2023, end_year: 2024, processors: ['Snapdragon 8 Gen 2'] },
        { model: 'Xiaomi 13T',             release_year: 2023, end_year: 2024, processors: ['Dimensity 8200 Ultra'] },
        { model: 'Xiaomi 14',              release_year: 2024,                 processors: ['Snapdragon 8 Gen 3'] },
        { model: 'Xiaomi 14 Pro',          release_year: 2024,                 processors: ['Snapdragon 8 Gen 3'] },
        { model: 'Xiaomi 14T',             release_year: 2024,                 processors: ['Dimensity 9300+'] },
        { model: 'Xiaomi 15',              release_year: 2025,                 processors: ['Snapdragon 8 Elite'] },
        { model: 'POCO X3 Pro',            release_year: 2021, end_year: 2022, processors: ['Snapdragon 860'] },
        { model: 'POCO X5',               release_year: 2023,                 processors: ['Snapdragon 695'] },
        { model: 'POCO X5 Pro',           release_year: 2023,                 processors: ['Snapdragon 778G'] },
        { model: 'POCO X6 Pro',           release_year: 2024,                 processors: ['Dimensity 8300 Ultra'] },
        { model: 'POCO F5',               release_year: 2023,                 processors: ['Snapdragon 7+ Gen 2'] },
        { model: 'POCO F6',               release_year: 2024,                 processors: ['Snapdragon 8s Gen 3'] },
        { model: 'POCO F6 Pro',           release_year: 2024,                 processors: ['Snapdragon 8 Gen 2'] },
      ],
    },
    {
      brand: 'Motorola',
      models: [
        { model: 'Moto G60',               release_year: 2021, end_year: 2022 },
        { model: 'Moto G71 5G',            release_year: 2022, end_year: 2023 },
        { model: 'Moto G72',               release_year: 2022, end_year: 2023 },
        { model: 'Moto G82 5G',            release_year: 2022, end_year: 2023 },
        { model: 'Moto G73 5G',            release_year: 2023 },
        { model: 'Moto G84 5G',            release_year: 2023 },
        { model: 'Moto G85',               release_year: 2024 },
        { model: 'Motorola Edge 30',       release_year: 2022, end_year: 2023 },
        { model: 'Motorola Edge 30 Pro',   release_year: 2022, end_year: 2023 },
        { model: 'Motorola Edge 40',       release_year: 2023 },
        { model: 'Motorola Edge 40 Pro',   release_year: 2023 },
        { model: 'Motorola Edge 40 Neo',   release_year: 2023 },
        { model: 'Motorola Edge 50',       release_year: 2024 },
        { model: 'Motorola Edge 50 Pro',   release_year: 2024 },
        { model: 'Motorola Edge 50 Ultra', release_year: 2024 },
        { model: 'Razr 40',               release_year: 2023 },
        { model: 'Razr 40 Ultra',         release_year: 2023 },
        { model: 'Razr 50',               release_year: 2024 },
        { model: 'Razr 50 Ultra',         release_year: 2024 },
      ],
    },
    {
      brand: 'Realme',
      models: [
        { model: 'Realme 9 Pro+',          release_year: 2022, end_year: 2023 },
        { model: 'Realme GT 2 Pro',        release_year: 2022, end_year: 2023 },
        { model: 'Realme GT Neo 3',        release_year: 2022, end_year: 2023 },
        { model: 'Realme 10 Pro',          release_year: 2022, end_year: 2023 },
        { model: 'Realme 11 Pro',          release_year: 2023 },
        { model: 'Realme 11 Pro+',         release_year: 2023 },
        { model: 'Realme 12 Pro',          release_year: 2024 },
        { model: 'Realme 12 Pro+',         release_year: 2024 },
        { model: 'Realme GT 6',            release_year: 2024 },
        { model: 'Realme C55',             release_year: 2023 },
        { model: 'Realme C65',             release_year: 2024 },
      ],
    },
    {
      brand: 'OPPO',
      models: [
        { model: 'OPPO Find X3 Pro',       release_year: 2021, end_year: 2022 },
        { model: 'OPPO Find X5',           release_year: 2022, end_year: 2023 },
        { model: 'OPPO Find X5 Pro',       release_year: 2022, end_year: 2023 },
        { model: 'OPPO Find X6 Pro',       release_year: 2023 },
        { model: 'OPPO Find X7',           release_year: 2024 },
        { model: 'OPPO Reno 7 Pro',        release_year: 2022, end_year: 2023 },
        { model: 'OPPO Reno 8',            release_year: 2022, end_year: 2023 },
        { model: 'OPPO Reno 8 Pro',        release_year: 2022, end_year: 2023 },
        { model: 'OPPO Reno 10 Pro',       release_year: 2023 },
        { model: 'OPPO Reno 11',           release_year: 2024 },
        { model: 'OPPO Reno 11 Pro',       release_year: 2024 },
        { model: 'OPPO Reno 12 Pro',       release_year: 2024 },
        { model: 'OPPO A78',               release_year: 2023 },
        { model: 'OPPO A98',               release_year: 2023 },
      ],
    },
    {
      brand: 'Huawei',
      models: [
        { model: 'Huawei P40 Pro',         release_year: 2020 },
        { model: 'Huawei P50 Pro',         release_year: 2021 },
        { model: 'Huawei P60 Pro',         release_year: 2023 },
        { model: 'Huawei Mate 40 Pro',     release_year: 2020 },
        { model: 'Huawei Mate 50 Pro',     release_year: 2022 },
        { model: 'Huawei Mate 60 Pro',     release_year: 2023 },
        { model: 'Huawei nova 10 Pro',     release_year: 2022 },
        { model: 'Huawei nova 11 Pro',     release_year: 2023 },
        { model: 'Huawei nova 12 Pro',     release_year: 2024 },
      ],
    },
    {
      brand: 'Google',
      models: [
        { model: 'Pixel 5',               release_year: 2020, end_year: 2022, processors: ['Snapdragon 765G'] },
        { model: 'Pixel 5a',              release_year: 2021, end_year: 2022, processors: ['Snapdragon 765G'] },
        { model: 'Pixel 6',               release_year: 2021, end_year: 2023, processors: ['Google Tensor G1'] },
        { model: 'Pixel 6 Pro',           release_year: 2021, end_year: 2023, processors: ['Google Tensor G1'] },
        { model: 'Pixel 6a',              release_year: 2022, end_year: 2023, processors: ['Google Tensor G1'] },
        { model: 'Pixel 7',               release_year: 2022, end_year: 2024, processors: ['Google Tensor G2'] },
        { model: 'Pixel 7 Pro',           release_year: 2022, end_year: 2024, processors: ['Google Tensor G2'] },
        { model: 'Pixel 7a',              release_year: 2023, end_year: 2024, processors: ['Google Tensor G2'] },
        { model: 'Pixel 8',               release_year: 2023,                 processors: ['Google Tensor G3'] },
        { model: 'Pixel 8 Pro',           release_year: 2023,                 processors: ['Google Tensor G3'] },
        { model: 'Pixel 8a',              release_year: 2024,                 processors: ['Google Tensor G3'] },
        { model: 'Pixel 9',               release_year: 2024,                 processors: ['Google Tensor G4'] },
        { model: 'Pixel 9 Pro',           release_year: 2024,                 processors: ['Google Tensor G4'] },
        { model: 'Pixel 9 Pro XL',        release_year: 2024,                 processors: ['Google Tensor G4'] },
        { model: 'Pixel 9 Pro Fold',      release_year: 2024,                 processors: ['Google Tensor G4'] },
      ],
    },
    {
      brand: 'OnePlus',
      models: [
        { model: 'OnePlus Nord CE 2',      release_year: 2022, end_year: 2023 },
        { model: 'OnePlus Nord CE 3',      release_year: 2023 },
        { model: 'OnePlus Nord 3',         release_year: 2023 },
        { model: 'OnePlus Nord 4',         release_year: 2024 },
        { model: 'OnePlus 10 Pro',         release_year: 2022, end_year: 2023 },
        { model: 'OnePlus 11',             release_year: 2023 },
        { model: 'OnePlus 12',             release_year: 2024 },
        { model: 'OnePlus 12R',            release_year: 2024 },
        { model: 'OnePlus 13',             release_year: 2025 },
      ],
    },
    {
      brand: 'Vivo',
      models: [
        { model: 'Vivo V23 Pro',           release_year: 2022 },
        { model: 'Vivo V25 Pro',           release_year: 2022 },
        { model: 'Vivo V27 Pro',           release_year: 2023 },
        { model: 'Vivo V29 Pro',           release_year: 2023 },
        { model: 'Vivo V30',               release_year: 2024 },
        { model: 'Vivo V30 Pro',           release_year: 2024 },
        { model: 'Vivo X90 Pro',           release_year: 2023 },
        { model: 'Vivo X100 Pro',          release_year: 2024 },
        { model: 'Vivo Y200 Pro',          release_year: 2024 },
      ],
    },
  ],

  tablet: [
    {
      brand: 'Apple',
      models: [
        { model: 'iPad (9na gen)',                 release_year: 2021, end_year: 2022, processors: ['Apple A13 Bionic'] },
        { model: 'iPad (10ma gen)',                release_year: 2022,                processors: ['Apple A14 Bionic'] },
        { model: 'iPad mini (6ta gen)',            release_year: 2021,                processors: ['Apple A15 Bionic'] },
        { model: 'iPad mini (7ma gen)',            release_year: 2024,                processors: ['Apple A17 Pro'] },
        { model: 'iPad Air (4ta gen)',             release_year: 2020, end_year: 2022, processors: ['Apple A14 Bionic'] },
        { model: 'iPad Air (5ta gen)',             release_year: 2022, end_year: 2024, processors: ['Apple M1'] },
        { model: 'iPad Air M2 11"',                release_year: 2024,                processors: ['Apple M2'] },
        { model: 'iPad Air M2 13"',                release_year: 2024,                processors: ['Apple M2'] },
        { model: 'iPad Pro 11" (3ra gen)',         release_year: 2021, end_year: 2022, processors: ['Apple M1'] },
        { model: 'iPad Pro 11" (4ta gen)',         release_year: 2022, end_year: 2024, processors: ['Apple M2'] },
        { model: 'iPad Pro 11" M4',                release_year: 2024,                processors: ['Apple M4'] },
        { model: 'iPad Pro 12.9" (5ta gen)',       release_year: 2021, end_year: 2022, processors: ['Apple M1'] },
        { model: 'iPad Pro 12.9" (6ta gen)',       release_year: 2022, end_year: 2024, processors: ['Apple M2'] },
        { model: 'iPad Pro 13" M4',                release_year: 2024,                processors: ['Apple M4'] },
      ],
    },
    {
      brand: 'Samsung',
      models: [
        { model: 'Galaxy Tab A8 10.5"',            release_year: 2022, end_year: 2024 },
        { model: 'Galaxy Tab A9 8.7"',             release_year: 2023 },
        { model: 'Galaxy Tab A9+ 11"',             release_year: 2023 },
        { model: 'Galaxy Tab S6 Lite 10.4"',       release_year: 2020 },
        { model: 'Galaxy Tab S7 11"',              release_year: 2020, end_year: 2022 },
        { model: 'Galaxy Tab S7 FE 12.4"',         release_year: 2021, end_year: 2023 },
        { model: 'Galaxy Tab S8 11"',              release_year: 2022, end_year: 2024 },
        { model: 'Galaxy Tab S8+ 12.4"',           release_year: 2022, end_year: 2024 },
        { model: 'Galaxy Tab S8 Ultra 14.6"',      release_year: 2022, end_year: 2024 },
        { model: 'Galaxy Tab S9 11"',              release_year: 2023 },
        { model: 'Galaxy Tab S9+ 12.4"',           release_year: 2023 },
        { model: 'Galaxy Tab S9 Ultra 14.6"',      release_year: 2023 },
        { model: 'Galaxy Tab S9 FE 10.9"',         release_year: 2023 },
        { model: 'Galaxy Tab S10 11"',             release_year: 2024 },
        { model: 'Galaxy Tab S10 Ultra 14.6"',     release_year: 2024 },
        { model: 'Galaxy Tab S10 FE',              release_year: 2025 },
      ],
    },
    {
      brand: 'Lenovo',
      models: [
        { model: 'Tab M9 8.7"',                    release_year: 2022 },
        { model: 'Tab M10 Plus (3ra gen) 10.6"',   release_year: 2022 },
        { model: 'Tab M11 10.95"',                 release_year: 2024 },
        { model: 'Tab P12 12.7"',                  release_year: 2023 },
        { model: 'Tab P12 Pro 12.6"',              release_year: 2022, end_year: 2023 },
        { model: 'Tab Extreme 14.5"',              release_year: 2023 },
      ],
    },
    {
      brand: 'Xiaomi',
      models: [
        { model: 'Mi Pad 5 11"',                   release_year: 2021, end_year: 2022 },
        { model: 'Mi Pad 5 Pro 11"',               release_year: 2021, end_year: 2022 },
        { model: 'Redmi Pad 10.6"',                release_year: 2022 },
        { model: 'Redmi Pad SE 11"',               release_year: 2023 },
        { model: 'Redmi Pad Pro 12.1"',            release_year: 2024 },
        { model: 'Xiaomi Pad 6 11"',               release_year: 2023 },
        { model: 'Xiaomi Pad 6 Pro 11"',           release_year: 2023 },
        { model: 'Xiaomi Pad 6 Max 14"',           release_year: 2023 },
        { model: 'Xiaomi Pad 7 11.2"',             release_year: 2025 },
      ],
    },
    {
      brand: 'Huawei',
      models: [
        { model: 'MatePad 11 2021',                release_year: 2021, end_year: 2022 },
        { model: 'MatePad 11 2023',                release_year: 2023 },
        { model: 'MatePad Pro 12.6"',              release_year: 2021 },
        { model: 'MatePad Pro 13.2"',              release_year: 2023 },
        { model: 'MatePad Air 11.5"',              release_year: 2023 },
      ],
    },
    {
      brand: 'Amazon',
      models: [
        { model: 'Fire HD 8 (2022)',                release_year: 2022 },
        { model: 'Fire HD 8 Plus (2022)',           release_year: 2022 },
        { model: 'Fire HD 10 (2021)',               release_year: 2021, end_year: 2023 },
        { model: 'Fire HD 10 Plus (2021)',          release_year: 2021, end_year: 2023 },
        { model: 'Fire Max 11 (2023)',              release_year: 2023 },
        { model: 'Fire HD 8 (2024)',                release_year: 2024 },
      ],
    },
    {
      brand: 'Microsoft',
      models: [
        { model: 'Surface Pro 8',                  release_year: 2021, end_year: 2022 },
        { model: 'Surface Pro 9 (Intel)',          release_year: 2022, end_year: 2024 },
        { model: 'Surface Pro 9 (SQ3)',            release_year: 2022, end_year: 2024 },
        { model: 'Surface Pro 10',                 release_year: 2024 },
        { model: 'Surface Go 3',                   release_year: 2021, end_year: 2023 },
        { model: 'Surface Go 4',                   release_year: 2023 },
      ],
    },
  ],

  desktop: [
    {
      brand: 'Apple',
      models: [
        { model: 'Mac mini (M1, 2020)',             release_year: 2020, end_year: 2023, processors: ['Apple M1'] },
        { model: 'Mac mini (M2, 2023)',             release_year: 2023, end_year: 2024, processors: ['Apple M2', 'Apple M2 Pro'] },
        { model: 'Mac mini (M4, 2024)',             release_year: 2024,                processors: ['Apple M4', 'Apple M4 Pro'] },
        { model: 'iMac 24" (M1, 2021)',             release_year: 2021, end_year: 2023, processors: ['Apple M1'] },
        { model: 'iMac 24" (M3, 2023)',             release_year: 2023,                processors: ['Apple M3'] },
        { model: 'iMac 24" (M4, 2024)',             release_year: 2024,                processors: ['Apple M4'] },
        { model: 'Mac Studio (M1 Max, 2022)',        release_year: 2022, end_year: 2023, processors: ['Apple M1 Max', 'Apple M1 Ultra'] },
        { model: 'Mac Studio (M2 Max, 2023)',        release_year: 2023, end_year: 2025, processors: ['Apple M2 Max', 'Apple M2 Ultra'] },
        { model: 'Mac Studio (M4 Max, 2025)',        release_year: 2025,                processors: ['Apple M4 Max'] },
        { model: 'Mac Pro (2019)',                   release_year: 2019, end_year: 2023 }, // Intel Xeon W — sin restricción
        { model: 'Mac Pro (M2 Ultra, 2023)',         release_year: 2023,                processors: ['Apple M2 Ultra'] },
      ],
    },
    {
      brand: 'Dell',
      models: [
        { model: 'OptiPlex 3090',                   release_year: 2021, end_year: 2023 },
        { model: 'OptiPlex 7090',                   release_year: 2021, end_year: 2023 },
        { model: 'OptiPlex Tower Plus 7010',         release_year: 2023 },
        { model: 'XPS Desktop 8940',                release_year: 2021, end_year: 2022 },
        { model: 'XPS Desktop 8950',                release_year: 2022 },
        { model: 'Alienware Aurora R13',            release_year: 2021, end_year: 2022 },
        { model: 'Alienware Aurora R15',            release_year: 2022 },
        { model: 'Alienware Aurora R16',            release_year: 2023 },
        { model: 'Inspiron 3910 Tower',             release_year: 2022 },
        { model: 'Inspiron 3030 Tower',             release_year: 2024 },
      ],
    },
    {
      brand: 'HP',
      models: [
        { model: 'Pavilion TP01-3000',              release_year: 2022 },
        { model: 'Pavilion TP01-4000',              release_year: 2023 },
        { model: 'HP Elite 600 G9 Tower',           release_year: 2022 },
        { model: 'HP EliteDesk 800 G8',             release_year: 2021, end_year: 2022 },
        { model: 'HP EliteDesk 800 G9',             release_year: 2022 },
        { model: 'OMEN 45L GT22',                   release_year: 2022 },
        { model: 'OMEN GT22 (2024)',                 release_year: 2024 },
        { model: 'HP Z2 Tower G9',                  release_year: 2022 },
      ],
    },
    {
      brand: 'Lenovo',
      models: [
        { model: 'ThinkCentre M70q Gen 3',          release_year: 2022 },
        { model: 'ThinkCentre M70q Gen 4',          release_year: 2023 },
        { model: 'ThinkCentre M90q Gen 3',          release_year: 2022 },
        { model: 'IdeaCentre 5i Gen 8',             release_year: 2023 },
        { model: 'Legion Tower 5i Gen 8',           release_year: 2023 },
        { model: 'Legion Tower 7i Gen 7',           release_year: 2022 },
        { model: 'Legion Tower 7i Gen 8',           release_year: 2023 },
      ],
    },
    {
      brand: 'Asus',
      models: [
        { model: 'ROG Strix GT35 G35CZ',            release_year: 2021, end_year: 2022 },
        { model: 'ROG Strix G10DK',                 release_year: 2022 },
        { model: 'ROG Strix G16CH',                 release_year: 2023 },
        { model: 'ProArt Station PD500TC',          release_year: 2022 },
        { model: 'Mini PC PN64',                    release_year: 2022 },
        { model: 'ExpertCenter D5 Tower D500TC',    release_year: 2022 },
      ],
    },
    {
      brand: 'Acer',
      models: [
        { model: 'Aspire TC-1770',                  release_year: 2022 },
        { model: 'Aspire TC-1870',                  release_year: 2023 },
        { model: 'Nitro 50 N50-650',                release_year: 2022 },
        { model: 'Nitro 50 N50-660',                release_year: 2023 },
        { model: 'Predator Orion 3000 PO3-650',     release_year: 2022 },
        { model: 'Predator Orion 5000 PO5-655',     release_year: 2022 },
        { model: 'Veriton X4690G',                  release_year: 2022 },
      ],
    },
    {
      brand: 'MSI',
      models: [
        { model: 'MEG Trident X2 13NUF',            release_year: 2023 },
        { model: 'Infinite RS 13NUI',               release_year: 2023 },
        { model: 'PRO DP180 13MH',                  release_year: 2023 },
        { model: 'PRO DP21 12M',                    release_year: 2022, end_year: 2023 },
        { model: 'Trident AS 12SI',                 release_year: 2022 },
      ],
    },
  ],
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getYearRange(
  category: string,
  brand: string,
  model: string,
): [number, number] {
  const currentYear = new Date().getFullYear()
  if (!category || !brand || brand === 'Otra marca' || !model || model === 'Otro modelo') {
    return [2010, currentYear]
  }
  const catalogBrands = DEVICE_CATALOG[category as DeviceCategory]
  if (!catalogBrands) return [2010, currentYear]
  const brandEntry = catalogBrands.find((b) => b.brand === brand)
  if (!brandEntry) return [2010, currentYear]
  const modelEntry = brandEntry.models.find((m) => m.model === model)
  if (!modelEntry) return [2010, currentYear]
  // Cap the manufacture year to the model's production window (+1y margin), never
  // beyond the current year — a "MacBook Air (M1, 2020)" was not built in 2025.
  const max = Math.min(currentYear, (modelEntry.end_year ?? currentYear) + 1)
  return [modelEntry.release_year, max]
}

export function buildYearOptions(
  category: string,
  brand: string,
  model: string,
): string[] {
  const [min, max] = getYearRange(category, brand, model)
  const years: string[] = []
  for (let y = max; y >= min; y--) {
    years.push(String(y))
  }
  return years
}

// ── Processor catalog ─────────────────────────────────────────────────────────

export interface ProcessorGroup {
  group: string
  onlyFor?: string[] // show only for these brands; if absent = show for all
  notFor?: string[]  // hide for these brands
  processors: string[]
}

export const PROCESSOR_GROUPS_BY_CATEGORY: Record<DeviceCategory, ProcessorGroup[]> = {
  laptop: [
    {
      group: 'Apple Silicon',
      onlyFor: ['Apple'],
      processors: [
        'Apple M1', 'Apple M1 Pro', 'Apple M1 Max',
        'Apple M2', 'Apple M2 Pro', 'Apple M2 Max',
        'Apple M3', 'Apple M3 Pro', 'Apple M3 Max',
        'Apple M4', 'Apple M4 Pro', 'Apple M4 Max',
      ],
    },
    {
      group: 'Intel Core Ultra (Series 2)',
      notFor: ['Apple'],
      processors: [
        'Intel Core Ultra 5 225H', 'Intel Core Ultra 5 226V',
        'Intel Core Ultra 7 255H', 'Intel Core Ultra 7 258V',
        'Intel Core Ultra 9 285H',
      ],
    },
    {
      group: 'Intel Core Ultra (Series 1)',
      notFor: ['Apple'],
      processors: [
        'Intel Core Ultra 5 125H', 'Intel Core Ultra 5 125U',
        'Intel Core Ultra 7 155H', 'Intel Core Ultra 7 165H',
        'Intel Core Ultra 9 185H',
      ],
    },
    {
      group: 'Intel Core (13va gen)',
      notFor: ['Apple'],
      processors: [
        'Intel Core i5-1335U', 'Intel Core i5-1340P', 'Intel Core i5-13500H',
        'Intel Core i7-1365U', 'Intel Core i7-13700H',
        'Intel Core i9-13900H', 'Intel Core i9-13980HX',
      ],
    },
    {
      group: 'Intel Core (12va gen)',
      notFor: ['Apple'],
      processors: [
        'Intel Core i5-1235U', 'Intel Core i5-12450H',
        'Intel Core i7-1255U', 'Intel Core i7-12700H',
        'Intel Core i9-12900H', 'Intel Core i9-12900HX',
      ],
    },
    {
      group: 'AMD Ryzen (serie 7000/AI)',
      notFor: ['Apple'],
      processors: [
        'AMD Ryzen 5 7530U', 'AMD Ryzen 5 7535HS',
        'AMD Ryzen 7 7730U', 'AMD Ryzen 7 7745HX',
        'AMD Ryzen 7 7840HS', 'AMD Ryzen 9 7940HX',
        'AMD Ryzen AI 5 340', 'AMD Ryzen AI 7 350', 'AMD Ryzen AI 9 HX 370',
      ],
    },
    {
      group: 'AMD Ryzen (serie 5000/6000)',
      notFor: ['Apple'],
      processors: [
        'AMD Ryzen 5 5500U', 'AMD Ryzen 5 5600H', 'AMD Ryzen 5 6600H',
        'AMD Ryzen 7 5700U', 'AMD Ryzen 7 5800H', 'AMD Ryzen 7 6800H',
        'AMD Ryzen 9 5900HX', 'AMD Ryzen 9 6900HX',
      ],
    },
    {
      group: 'Qualcomm Snapdragon X (ARM)',
      onlyFor: ['Microsoft'],
      processors: ['Qualcomm Snapdragon X Elite', 'Qualcomm Snapdragon X Plus'],
    },
  ],

  smartphone: [
    {
      group: 'Apple Bionic / A-series',
      onlyFor: ['Apple'],
      processors: [
        'Apple A14 Bionic', 'Apple A15 Bionic',
        'Apple A16 Bionic', 'Apple A17 Pro',
        'Apple A18', 'Apple A18 Pro',
      ],
    },
    {
      group: 'Qualcomm Snapdragon (flagship)',
      notFor: ['Apple', 'Huawei'],
      processors: [
        'Snapdragon 8 Gen 3', 'Snapdragon 8 Gen 2',
        'Snapdragon 8+ Gen 1', 'Snapdragon 8 Gen 1', 'Snapdragon 888',
      ],
    },
    {
      group: 'Qualcomm Snapdragon (gama media-alta)',
      notFor: ['Apple', 'Huawei'],
      processors: [
        'Snapdragon 7s Gen 3', 'Snapdragon 7s Gen 2',
        'Snapdragon 7 Gen 1', 'Snapdragon 778G', 'Snapdragon 695',
      ],
    },
    {
      group: 'Samsung Exynos',
      onlyFor: ['Samsung'],
      processors: [
        'Exynos 2400', 'Exynos 2200', 'Exynos 2100',
        'Exynos 1380', 'Exynos 1280',
      ],
    },
    {
      group: 'MediaTek Dimensity (flagship)',
      notFor: ['Apple', 'Huawei'],
      processors: [
        'Dimensity 9300', 'Dimensity 9300+',
        'Dimensity 9200', 'Dimensity 9000+', 'Dimensity 8300',
      ],
    },
    {
      group: 'MediaTek Dimensity (gama media)',
      notFor: ['Apple', 'Huawei'],
      processors: [
        'Dimensity 8200', 'Dimensity 7200',
        'Dimensity 1080', 'Helio G99',
      ],
    },
    {
      group: 'Huawei Kirin',
      onlyFor: ['Huawei'],
      processors: [
        'Kirin 9010', 'Kirin 9000S', 'Kirin 9000E',
        'Kirin 990', 'Kirin 980',
      ],
    },
    {
      group: 'Google Tensor',
      onlyFor: ['Google'],
      processors: [
        'Google Tensor G4', 'Google Tensor G3',
        'Google Tensor G2', 'Google Tensor G1',
      ],
    },
  ],

  tablet: [
    {
      group: 'Apple Silicon / Bionic',
      onlyFor: ['Apple'],
      processors: [
        'Apple M4', 'Apple M2', 'Apple M1',
        'Apple A16', 'Apple A15 Bionic', 'Apple A14 Bionic',
      ],
    },
    {
      group: 'Qualcomm Snapdragon',
      notFor: ['Apple', 'Amazon', 'Microsoft'],
      processors: [
        'Snapdragon 8 Gen 3', 'Snapdragon 8 Gen 2',
        'Snapdragon 870', 'Snapdragon 888',
      ],
    },
    {
      group: 'Samsung Exynos',
      onlyFor: ['Samsung'],
      processors: [
        'Exynos 2400', 'Exynos 2200', 'Exynos 1380',
      ],
    },
    {
      group: 'MediaTek',
      notFor: ['Apple', 'Microsoft', 'Amazon'],
      processors: [
        'Dimensity 9000+', 'Dimensity 8020',
        'Helio G99', 'MediaTek MT8768',
      ],
    },
    {
      group: 'Intel Core (Surface)',
      onlyFor: ['Microsoft'],
      processors: [
        'Intel Core Ultra 5 (Series 2)', 'Intel Core Ultra 7 (Series 2)',
        'Intel Core i5 (12va gen)', 'Intel Core i7 (12va gen)',
        'Qualcomm Snapdragon X Plus',
      ],
    },
    {
      group: 'Amazon',
      onlyFor: ['Amazon'],
      processors: [
        'MediaTek MT8696', 'MediaTek MT8788', 'MediaTek MT8183',
      ],
    },
  ],

  desktop: [
    {
      group: 'Apple Silicon',
      onlyFor: ['Apple'],
      processors: [
        'Apple M4 Max', 'Apple M4 Pro', 'Apple M4',
        'Apple M3 Max', 'Apple M3 Pro', 'Apple M3',
        'Apple M2 Ultra', 'Apple M2 Max', 'Apple M2 Pro', 'Apple M2',
        'Apple M1 Ultra', 'Apple M1 Max', 'Apple M1 Pro', 'Apple M1',
      ],
    },
    {
      group: 'Intel Core (14va/15va gen)',
      notFor: ['Apple'],
      processors: [
        'Intel Core Ultra 9 285K', 'Intel Core Ultra 7 265K', 'Intel Core Ultra 5 245K',
        'Intel Core i9-14900K', 'Intel Core i7-14700K',
        'Intel Core i5-14600K', 'Intel Core i5-14400',
      ],
    },
    {
      group: 'Intel Core (13va gen)',
      notFor: ['Apple'],
      processors: [
        'Intel Core i9-13900K', 'Intel Core i7-13700K',
        'Intel Core i5-13600K', 'Intel Core i5-13400',
      ],
    },
    {
      group: 'Intel Core (12va gen)',
      notFor: ['Apple'],
      processors: [
        'Intel Core i9-12900K', 'Intel Core i7-12700K',
        'Intel Core i5-12600K', 'Intel Core i5-12400',
      ],
    },
    {
      group: 'AMD Ryzen (serie 9000/7000)',
      notFor: ['Apple'],
      processors: [
        'AMD Ryzen 9 9950X', 'AMD Ryzen 9 9900X',
        'AMD Ryzen 7 9700X', 'AMD Ryzen 5 9600X',
        'AMD Ryzen 9 7950X', 'AMD Ryzen 9 7900X',
        'AMD Ryzen 7 7700X', 'AMD Ryzen 5 7600X',
      ],
    },
    {
      group: 'AMD Ryzen (serie 5000)',
      notFor: ['Apple'],
      processors: [
        'AMD Ryzen 9 5950X', 'AMD Ryzen 9 5900X',
        'AMD Ryzen 7 5700X', 'AMD Ryzen 5 5600X',
      ],
    },
  ],
}

export function getProcessorGroups(
  category: DeviceCategory,
  brand: string,
  model?: string,
): ProcessorGroup[] {
  // 1. If the selected model has a fixed processor list, use only that
  if (model && model !== 'Otro modelo' && brand && brand !== 'Otra marca') {
    const catalogBrands = DEVICE_CATALOG[category]
    const modelEntry = catalogBrands
      ?.find((b) => b.brand === brand)
      ?.models.find((m) => m.model === model)
    if (modelEntry?.processors && modelEntry.processors.length > 0) {
      return [{ group: 'Compatible con este modelo', processors: modelEntry.processors }]
    }
  }
  // 2. Fall back to brand/category filtering
  const groups = PROCESSOR_GROUPS_BY_CATEGORY[category] ?? []
  if (!brand) return groups   // unknown brand → show all groups
  return groups.filter((g) => {
    if (g.onlyFor && !g.onlyFor.includes(brand)) return false
    if (g.notFor && g.notFor.includes(brand)) return false
    return true
  })
}

// ── Per-category RAM / Storage options ────────────────────────────────────────

export const RAM_BY_CATEGORY: Record<DeviceCategory, string[]> = {
  laptop:     ['4 GB', '8 GB', '16 GB', '24 GB', '32 GB', '64 GB'],
  smartphone: ['4 GB', '6 GB', '8 GB', '12 GB', '16 GB'],
  tablet:     ['4 GB', '6 GB', '8 GB', '12 GB', '16 GB', '32 GB'],
  desktop:    ['8 GB', '16 GB', '32 GB', '64 GB', '128 GB'],
}

export const STORAGE_BY_CATEGORY: Record<DeviceCategory, string[]> = {
  laptop:     ['128 GB', '256 GB', '512 GB', '1 TB', '2 TB'],
  smartphone: ['64 GB', '128 GB', '256 GB', '512 GB', '1 TB'],
  tablet:     ['32 GB', '64 GB', '128 GB', '256 GB', '512 GB', '1 TB', '2 TB'],
  desktop:    ['256 GB SSD', '512 GB SSD', '1 TB SSD', '2 TB SSD', '1 TB HDD', '2 TB HDD', '4 TB HDD', '1 TB SSD + 1 TB HDD'],
}

// Categories that have a battery (slider visible)
export const CATEGORY_HAS_BATTERY: Record<DeviceCategory, boolean> = {
  laptop:     true,
  smartphone: true,
  tablet:     true,
  desktop:    false,
}
