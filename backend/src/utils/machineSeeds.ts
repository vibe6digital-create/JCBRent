// Machine categories and models seeded from vendor pricing PDF
// Category name → array of model names

export const MACHINE_SEED_DATA: Record<string, string[]> = {

  'Backhoe Loader': [
    // JCB
    'JCB 2DX', 'JCB 3DX', 'JCB 4DX', 'JCB 3DX Xtra', 'JCB 3DX Plus', 'JCB 3DXL Plus',
    // CASE
    'CASE 770 NX', 'CASE 770NX MAGNUM', 'CASE 851 NX', 'CASE 770 EX Plus',
    // CAT
    'CAT 424', 'CAT 424 B', 'CAT 424 B2',
    // Mahindra
    'Mahindra EarthMaster SXL', 'Mahindra Earthmaster SX', 'Mahindra SX 4WD',
    'Mahindra SX Smart 50', 'Mahindra EarthMaster VX IV', 'Mahindra Earthmaster SX90 4WD',
    'Mahindra Earthmaster SX IV', 'Mahindra Earthmaster VX', 'Mahindra Earthmaster SXE',
    // Tata Hitachi
    'Tata Hitachi Shinrai Power', 'Tata Hitachi Shinrai Pro', 'Tata Hitachi Shinrai Prime L',
    'Tata Hitachi Shinrai Prime', 'Tata Hitachi Shinrai', 'Tata Hitachi Shinrai Power 4WD',
    // ACE
    'ACE AX-124', 'ACE AX-124 NS', 'ACE AX-124 4WD', 'ACE AX-130',
    'ACE Phantom 2WD', 'ACE Phantom 4WD', 'ACE AX 124 Eco-master', 'ACE AX 130 L', 'ACE Phantom 4WD N',
    // BOBCAT
    'BOBCAT B900', 'BOBCAT B900 Xtra CEV-V',
    // ESCORTS
    'ESCORTS Digmax II', 'ESCORTS Digmax II 4WD', 'ESCORTS XT 1610 4WD', 'ESCORTS XT 1610 2WD',
    'ESCORTS DIGMAX SUPER', 'ESCORTS Digmax II XP', 'ESCORTS Loadmax II', 'ESCORTS BLX 75', 'ESCORTS BLX75K',
    // BULL
    'BULL Agri', 'BULL HD 100', 'BULL HD 76', 'BULL CH76 Challenger',
    'BULL HD 76 4WD', 'BULL HD 76 BS IV', 'BULL SD76', 'BULL Smart 60', 'BULL Grandia', 'BULL Grandia DLX',
    // Manitou
    'Manitou TLB 740S', 'Manitou TLB 844S', 'Manitou 860SX', 'Manitou MBL 745',
    'Manitou MBL 745 S', 'Manitou TLB 818', 'Manitou MBL 745HT S', 'Manitou MBL 745 HT',
    'Manitou MBL 745 HT RANGER', 'Manitou MBL 745 RANGER',
    // PRL
    'PRL 4CX',
  ],

  'Mini Excavator': [
    // Tata Hitachi
    'Tata Hitachi Zaxis 38 U', 'Tata Hitachi Zaxis 33 U', 'Tata Hitachi EX 70 Prime',
    'Tata Hitachi NX 30', 'Tata Hitachi Zaxis 23 U', 'Tata Hitachi TMX 20 Neo',
    'Tata Hitachi NX 80', 'Tata Hitachi NX 50',
    // JCB
    'JCB NXT 140', 'JCB 30Plus', 'JCB 100C1', 'JCB 50Z', 'JCB 55Z',
    'JCB 35Z HD', 'JCB 37C HD', 'JCB 18Z',
    // BOBCAT
    'BOBCAT E20Z', 'BOBCAT E32', 'BOBCAT E26', 'BOBCAT E37 ULTRA HD', 'BOBCAT E37 XTRA HD',
    'BOBCAT E64', 'BOBCAT E27', 'BOBCAT E30', 'BOBCAT E50z',
    // CAT
    'CAT 305.5E', 'CAT 305.5E2', 'CAT 313D2 L',
    // Takeuchi
    'Takeuchi TB 219',
    // HYUNDAI
    'HYUNDAI Robex 35 Z-9', 'HYUNDAI R30Z-9AK', 'HYUNDAI HX30AZ', 'HYUNDAI HX35Az',
    // Kobelco
    'Kobelco SK35SR', 'Kobelco SK30SR',
    // Komatsu
    'Komatsu PC130-7', 'Komatsu PC71',
    // KUBOTA
    'KUBOTA U17-3', 'KUBOTA U30-6', 'KUBOTA U50-5', 'KUBOTA U50-5S', 'KUBOTA U22-3',
    // LiuGong
    'LiuGong 908E', 'LiuGong CLG908E',
    // ORANGE
    'ORANGE OR-EX 0.6',
    // SANY
    'SANY SY120C-9', 'SANY SY140C-9', 'SANY SY140C-9S', 'SANY SY20C', 'SANY SY35U',
    'SANY SY20U', 'SANY SY27U', 'SANY SY60C', 'SANY SY140C-9/9S Tunnel',
    // Others
    'SHOBHAGYA SS-EX1.3', 'Sona RDT-17', 'Sona SDT-10',
    'Yanmar VIO20-6', 'Yanmar VIO35-6B', 'Yanmar VIO50-6B',
  ],

  'Excavator': [
    // CAT
    'CAT 320D3', 'CAT 320D3 GC', 'CAT 323D3', 'CAT 320D', 'CAT 330 GC',
    // HYUNDAI
    'HYUNDAI Robex 210 SMART', 'HYUNDAI 210 SMART PLUS', 'HYUNDAI R 210-LC 7',
    'HYUNDAI Robex 140LC-9', 'HYUNDAI 85A SMART', 'HYUNDAI R230LM Smart',
    'HYUNDAI R80-7', 'HYUNDAI Robex 140LC-9V', 'HYUNDAI Robex 340L SMART', 'HYUNDAI HX360L',
    'HYUNDAI 130 SMART',
    // Volvo
    'Volvo EC210D', 'Volvo EC480DL', 'Volvo EC140D', 'Volvo EC140DL',
    'Volvo EC200D', 'Volvo EC250D', 'Volvo EC950E', 'Volvo EC300D',
    // CASE
    'CASE CX 220C', 'CASE CX 220C LC',
    // Kobelco
    'Kobelco SK140', 'Kobelco SK140HDLC', 'Kobelco SK140HDLC-8',
    'Kobelco SK220XDLC', 'Kobelco SK220XDLC-10', 'Kobelco SK350LC', 'Kobelco SK380HDLC',
    // Komatsu
    'Komatsu PC210', 'Komatsu PC210 LC', 'Komatsu PC210 LC11', 'Komatsu PC300-6',
    'Komatsu PC 130-11', 'Komatsu PC210 LC-10M0', 'Komatsu PC210 LC-8M0',
    'Komatsu PC210-10M0', 'Komatsu PC300LC', 'Komatsu PC300LC-8M0', 'Komatsu PC350LC-8M0',
    // LiuGong
    'LiuGong 921 Di', 'LiuGong 915E', 'LiuGong 922E', 'LiuGong 924E',
    'LiuGong 924E XD', 'LiuGong 926E XD', 'LiuGong CLG925EII',
    // SANY
    'SANY SY80C-9', 'SANY SY155W', 'SANY SY210C', 'SANY SY215C-9LC', 'SANY SY210C-9',
    'SANY SY220C-9', 'SANY SY220C-9LC', 'SANY SY225C-10HD GENe', 'SANY SY240C-9HD',
    'SANY SY260C-10HD GENe', 'SANY SY215C-9LCS', 'SANY SY350C-9HD',
    // Tata Hitachi
    'Tata Hitachi EX 200LC Super', 'Tata Hitachi EX 210LC', 'Tata Hitachi EX 110',
    'Tata Hitachi EX 215LCQ', 'Tata Hitachi EX 200LC Tunnel', 'Tata Hitachi Zaxis 220lc Ultra',
    'Tata Hitachi EX 210 Infra',
    // ZOOMLION
    'ZOOMLION ZE210Ei', 'ZOOMLION ZE215E', 'ZOOMLION ZE365E',
    // Leeboy
    'Leeboy 523',
  ],

  'Heavy Duty Excavator': [
    // JCB
    'JCB 130', 'JCB 315LC HD', 'JCB JS81', 'JCB 380LC XTRA', 'JCB 385LC QUARRY MASTER',
    'JCB 380LC QM', 'JCB 225LC ECO PLUS', 'JCB 345 LC HD', 'JCB 385LC',
    // Tata Hitachi
    'Tata Hitachi Zaxis 220 LCM', 'Tata Hitachi EX 70 Super Plus', 'Tata Hitachi Zaxis 140 H',
    'Tata Hitachi EX 110 SUPER', 'Tata Hitachi EX 130 Super', 'Tata Hitachi Zaxis 80',
    'Tata Hitachi ZAXIS 400 MTH', 'Tata Hitachi ZAXIS 370LCH', 'Tata Hitachi EX215lc-SLR',
    'Tata Hitachi EX 200 Infra', 'Tata Hitachi EX 130 Prime', 'Tata Hitachi Zaxis 140H Ultra',
    'Tata Hitachi EX 200LC Prime', 'Tata Hitachi EX 210LC Prime',
    // CAT
    'CAT 320C', 'CAT 320CL', 'CAT 336E',
    // Kobelco
    'Kobelco SK380XDLC-10', 'Kobelco SK520 XD LC-10', 'Kobelco SK850LC', 'Kobelco SK 145XDLC',
    // Komatsu
    'Komatsu PC 100', 'Komatsu PC450LC-7', 'Komatsu PC500LC-10R',
    // LiuGong
    'LiuGong 950E', 'LiuGong CLG950EIIIA',
    // SANY
    'SANY SY380LC-10HD', 'SANY SY870C-10HD', 'SANY SY390C 10HD Grama',
    'SANY SY500LC-9H', 'SANY SY980C-10HD', 'SANY SY500C-10HD', 'SANY SY580C-10HD',
  ],

  'Telehandler': [
    'JCB LOADALL 53-110', 'JCB 530-70', 'JCB 540-70', 'JCB 530-110', 'JCB 540-180',
  ],

  'Tipper': [
    // Tata
    'Tata Signa 4825.TK', 'Tata Signa 3530.TK', 'Tata Signa 2823.K HD 9S', 'Tata Signa 2830.K',
    'Tata Signa 4830.TK', 'Tata Signa 3525.K/TK', 'Tata Signa 3523.TK', 'Tata Signa 1918.K',
    'Tata Signa 1923.K', 'Tata Signa 4225.TK', 'Tata Signa 2825.K/TK', 'Tata Signa 2823.K/TK 6S STD',
    'Tata Signa 2820.K', 'Tata Signa 4832.TK', 'Tata 912 LPK', 'Tata 1216 LPK', 'Tata LPK 1416',
    'Tata Prima E.28K', 'Tata Prima 3530.K', 'Tata Prima 2825.K/TK', 'Tata Prima 3525.K/TK',
    'Tata Prima 2830.K', 'Tata Prima G.35K', 'Tata Prima 3528.K', 'Tata Prima 2832.TK',
    'Tata Prima 3532.TK', 'Tata Prima 35.K Auto Shift', 'Tata K.14 Ultra', 'Tata Prima FL 3530.S',
    'Tata 610 LPK', 'Tata 1212 LPK', 'Tata 710 SK', 'Tata 612 SK', 'Tata 610 SK',
    // BharatBenz
    'BharatBenz 2823C', 'BharatBenz 4828RT', 'BharatBenz 3528C', 'BharatBenz 1923C',
    'BharatBenz 1217C', 'BharatBenz 2826C', 'BharatBenz 4228RT', 'BharatBenz 2832CM',
    'BharatBenz 2828C', 'BharatBenz 3523RT', 'BharatBenz 3528CM', 'BharatBenz 3532CM',
    'BharatBenz 1926C', 'BharatBenz 2823RT', 'BharatBenz 5532T 6x4', 'BharatBenz 5032T',
    'BharatBenz 2832CM TORQSHIFT', 'BharatBenz 3532CM TORQSHIFT',
    'BharatBenz 2828C HX', 'BharatBenz 3532C HX', 'BharatBenz 2828CH',
    // Ashok Leyland
    'Ashok Leyland 4825 10x2 DTLA', 'Ashok Leyland 2820 6x4', 'Ashok Leyland AVTR U 4825 10x4',
    'Ashok Leyland 4825 10x4 DTLA', 'Ashok Leyland 3520 8x2', 'Ashok Leyland 2825 6x4 H6',
    'Ashok Leyland 2825 6X4', 'Ashok Leyland 3520 8x4', 'Ashok Leyland 3525 8X4',
    'Ashok Leyland 2832 6x4', 'Ashok Leyland 3525 8x4 H6', 'Ashok Leyland 3532 8x4',
    'Ashok Leyland 4225', 'Ashok Leyland 4220 10x2', 'Ashok Leyland 4220 10x4',
    'Ashok Leyland 4225 10x4', 'Ashok Leyland Taurus 3532',
    'Ashok Leyland Ecomet 1015TE', 'Ashok Leyland Ecomet 1215 TE',
    'Ashok Leyland Ecomet 1415 TE', 'Ashok Leyland Boss 1115 TB',
    // Eicher
    'Eicher Pro 2080XPT', 'Eicher Pro 6028T', 'Eicher Pro 2055T', 'Eicher Pro 6035T',
    'Eicher Pro 2095XPT', 'Eicher Pro 8028XC', 'Eicher Pro 6042 HT', 'Eicher Pro 8035XM',
    'Eicher Pro 8035XM AMT', 'Eicher Pro 8035XM EV', 'Eicher Pro 8028XM', 'Eicher Pro 6019XPT',
    'Eicher Pro 6019T', 'Eicher Pro 6035T HRT', 'Eicher Pro 2110 XPT Plus', 'Eicher Pro 2110XPT',
    // Mahindra
    'Mahindra Blazo X 48', 'Mahindra Blazo X 35 8x4', 'Mahindra Loadking Optimo',
    'Mahindra BLAZO X 35 M-DURA', 'Mahindra Blazo X 28', 'Mahindra Furio 7', 'Mahindra Loadking Optimo DSD',
    // Volvo
    'Volvo FMX 460 8x4', 'Volvo FM 420 8x4', 'Volvo FMX 460 33 CU.M', 'Volvo FMX 500 8x4',
    // Others
    'Scania G 500 XT', 'Olectra 6x4 Electric',
    'Propel 470 HEV COAL', 'Propel 470 MEV ROCK', 'Propel 470 HEV ROCK',
    'Montra Electric Rhino 2838 EV',
    'SML Isuzu Samrat GS', 'SML Isuzu Samrat XT Plus',
    'I-BOARD Elecy V3525',
  ],

  'Crane': [
    // ACE
    'ACE 5540', 'ACE 14XW', 'ACE 12XW', 'ACE F 150', 'ACE FX150', 'ACE 3625',
    'ACE TC 5040-T', 'ACE AB 163', 'ACE AB 203', 'ACE ACX 750', 'ACE F 160',
    'ACE FX 210', 'ACE FX 230', 'ACE MTC 2418', 'ACE MTC 3625', 'ACE NX 360° 20T',
    'ACE NXP 150', 'ACE Rhino 110 C', 'ACE RHINO 90 C', 'ACE TC 5540-T', 'ACE TC 7050',
    'ACE TM550', 'ACE TM 450', 'ACE TM 400', 'ACE TM 300', 'ACE TM 250 C',
    'ACE ACX 400', 'ACE HY130', 'ACE 20XW', 'ACE 18XW', 'ACE 16XW', 'ACE HXP 150',
    'ACE 15XWE', 'ACE TC 5034', 'ACE NX 360° 15T', 'ACE FP 210', 'ACE TX 130',
    'ACE FX 250', 'ACE FX 300', 'ACE F170', 'ACE F 210', 'ACE F 250', 'ACE F 230',
    'ACE F 270', 'ACE 40XW', 'ACE 75XW', 'ACE SB 203', 'ACE SB 163', 'ACE SB 123',
    'ACE SB 813', 'ACE AB 63', 'ACE TC 6040', 'ACE TC 6040-B', 'ACE TC 6544',
    'ACE LC 228B', 'ACE LC 160B', 'ACE LC 120', 'ACE LC 85', 'ACE AB 813',
    'ACE TM 250', 'ACE TC 6552', 'ACE TC 7052', 'ACE TC 7054', 'ACE TC 7059',
    'ACE TC 7074', 'ACE 15XW', 'ACE AB 113', 'ACE 25XW', 'ACE SX 150',
    // ESCORTS
    'ESCORTS Farana F15', 'ESCORTS HYDRA 14', 'ESCORTS White Line', 'ESCORTS F 1621',
    'ESCORTS 3012 XTR', 'ESCORTS F20', 'ESCORTS Hydra 12', 'ESCORTS Hydra 15',
    'ESCORTS Hydra 15 Top Jack', 'ESCORTS F23', 'ESCORTS F17', 'ESCORTS RT 20',
    'ESCORTS F23 2WD', 'ESCORTS Hydra 1565', 'ESCORTS F15 Fighter', 'ESCORTS RT 40',
    'ESCORTS Hydra 72', 'ESCORTS RT 30',
    // BULL
    'BULL 10 U',
    // Manitou
    'Manitou 120 AETJ', 'Manitou MHT 1490',
    // SANY
    'SANY SAC1800C', 'SANY SAC2200S', 'SANY SCC1000A', 'SANY SCC6500A',
    'SANY SDCY100K8H1-T', 'SANY SDCY90K8C2', 'SANY SRC250A1', 'SANY SRC400',
    'SANY STC 800', 'SANY STC1300C', 'SANY STC1600', 'SANY STC600S',
    'SANY SYT80', 'SANY STC800C', 'SANY SRC1100T', 'SANY SAC1600C7',
    'SANY STC600C', 'SANY SAC3000C8-8', 'SANY STC250C', 'SANY SCC1000A-6',
    // Kobelco
    'Kobelco 5035', 'Kobelco CKL1000i', 'Kobelco CKL1350i', 'Kobelco CKL2600i',
    // Demag
    'Demag AC 435', 'Demag AC265', 'Demag er45',
    // Potain
    'Potain MC125', 'Potain MCR295H16', 'Potain MCT 68', 'Potain MCT 85 F5', 'Potain MCT85', 'Potain MR160C',
    // Others
    'KRS 360', 'Krupp KMK 5160', 'Krupp KMK-4070', 'HITACHI KH 1000',
    'DEMEC International 11', 'Genie S 125', 'Bronto S62 MDT',
  ],
};
