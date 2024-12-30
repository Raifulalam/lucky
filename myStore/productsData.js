const mongoose = require('mongoose');
const products = [
    {
        name: "NEO INV 258LH CLS PLS WINE VIOLA(2S)-TL",
        image: "image_url_here",
        category: "Refrigerators",
        price: 51514.20, // MRP - 10%
        mrp: 57238,
        brand: "Whirlpool",
        keywords: ["Double Door", "Neo", "INV", "258LH", "CLS", "Wine", "Viola", "2S"],
        capacity: "258 L",
        description: "Stylish wine-colored fridge with Viola accents in a premium CLS finish.",
        model: "21919"
    },
    {
        name: "IF INV 355 TITAN STEEL(3S) CONV-TL",
        image: "image_url_here",
        category: "Refrigerators",
        price: 65039.40, // MRP - 10%
        mrp: 72266,
        brand: "Whirlpool",
        keywords: ["IF", "INV", "355", "Titan Steel", "3S", "Conv"],
        capacity: "355 L",
        description: "Advanced convertible fridge in Titan Steel with 3-section layout.",
        model: "22147"
    },
    {
        name: "IF INV ELT DF278 ARCTIC STEEL(2S)-TL",
        image: "image_url_here",
        category: "Refrigerators",
        price: 59242.50, // MRP - 10%
        mrp: 65825,
        brand: "Whirlpool",
        keywords: ["IF", "INV", "ELT", "DF278", "Arctic Steel", "2S"],
        capacity: "278 L",
        description: "Modern double door fridge in Arctic Steel finish with 2-section layout.",
        model: "21878"
    },
    {
        name: "IF INV ELT 278LH ATHENA STEEL(2S)-TL",
        image: "image_url_here",
        category: "Refrigerators",
        price: 59539.50, // MRP - 10%
        mrp: 66155,
        brand: "Whirlpool",
        keywords: ["IF", "INV", "ELT", "278LH", "Athena Steel", "2S"],
        capacity: "278 L",
        description: "Athena Steel design with a premium finish for a stylish double door fridge.",
        model: "21982"
    },
    {
        name: "IF INV ELT 278LH SAPPHIRE/WINE PEONY(2S)-TL",
        image: "image_url_here",
        category: "Refrigerators",
        price: 59985.90, // MRP - 10%
        mrp: 66651,
        brand: "Whirlpool",
        keywords: ["IF", "INV", "ELT", "278LH", "Sapphire", "Wine", "Peony", "2S"],
        capacity: "278 L",
        description: "Sapphire and Wine Peony color design for a chic double door fridge.",
        model: "21745/21748"
    },
    {
        name: "IF INV ELT 278LH WINE/SAPPHIRE PALM(2S)-TL",
        image: "image_url_here",
        category: "Refrigerators",
        price: 60283.90, // MRP - 10%
        mrp: 66981,
        brand: "Whirlpool",
        keywords: ["IF", "INV", "ELT", "278LH", "Wine", "Sapphire", "Palm", "2S"],
        capacity: "278 L",
        description: "Chic Wine and Sapphire Palm combination for an elegant fridge.",
        model: "21880/21881"
    },
    {
        name: "IF INV ELT DF278 ARCTIC/TITAN STEEL(3S)-TL",
        image: "image_url_here",
        category: "Refrigerators",
        price: 61768.80, // MRP - 10%
        mrp: 68632,
        brand: "Whirlpool",
        keywords: ["IF", "INV", "ELT", "DF278", "Arctic", "Titan Steel", "3S"],
        capacity: "278 L",
        description: "Double door fridge in Arctic and Titan Steel finish with 3 sections.",
        model: "21922/22102"
    },
    {
        name: "IF INV ELT 278GD CRYSTAL BLACK (2S)-TL",
        image: "image_url_here",
        category: "Refrigerators",
        price: 64890.00, // MRP - 10%
        mrp: 72100,
        brand: "Whirlpool",
        keywords: ["IF", "INV", "ELT", "278GD", "Crystal Black", "2S"],
        capacity: "278 L",
        description: "Sleek Crystal Black finish for a stylish and modern double door fridge.",
        model: "21671"
    },
    {
        name: "IF INV ELT 278GD CRYSTAL MIRROR (2S)-TL",
        image: "image_url_here",
        category: "Refrigerators",
        price: 65485.40, // MRP - 10%
        mrp: 72761,
        brand: "Whirlpool",
        keywords: ["IF", "INV", "ELT", "278GD", "Crystal Mirror", "2S"],
        capacity: "278 L",
        description: "Premium double door fridge with a sleek Crystal Mirror finish.",
        model: "21770"
    },
    {
        name: "IF INV ELT 278GD SKYDIVE (2S)-TL",
        image: "image_url_here",
        category: "Refrigerators",
        price: 65633.40, // MRP - 10%
        mrp: 72926,
        brand: "Whirlpool",
        keywords: ["IF", "INV", "ELT", "278GD", "Skydive", "2S"],
        capacity: "278 L",
        description: "Stylish fridge with a premium Skydive finish for a modern look.",
        model: "21970"
    },
    {
        name: "IF INV ELT 305GD CRYSTAL MIRROR (2S)-TL",
        image: "image_url_here",
        category: "Refrigerators",
        price: 71578.80, // MRP - 10%
        mrp: 79532,
        brand: "Whirlpool",
        keywords: ["IF", "INV", "ELT", "305GD", "Crystal Mirror", "2S"],
        capacity: "305 L",
        description: "Elegant double door fridge in Crystal Mirror finish for a luxurious feel.",
        model: "21778"
    },
    {
        name: "IF INV CNV 278 RADIANT/ARTEMIS STEEL(3S)-TL",
        image: "image_url_here",
        category: "Refrigerators",
        price: 59591.10, // MRP - 10%
        mrp: 65990,
        brand: "Whirlpool",
        keywords: ["IF", "INV", "CNV", "278", "Radiant", "Artemis Steel", "3S"],
        capacity: "278 L",
        description: "Sleek Radiant and Artemis Steel finish for a premium 3-section fridge.",
        model: "22139/22140"
    },
    {
        name: "IFPRO INV CNV 305 ARCTIC STEEL/BELLE EPOQUE/STEEL ONYX (2S)-TL",
        image: "image_url_here",
        category: "Refrigerators",
        price: 66228.30, // MRP - 10%
        mrp: 73587,
        brand: "Whirlpool",
        keywords: ["IFPRO", "INV", "CNV", "305", "Arctic Steel", "Belle Epoque", "Steel Onyx", "2S"],
        capacity: "305 L",
        description: "Stylish fridge with a combination of Arctic Steel, Belle Epoque, and Steel Onyx finishes.",
        model: "21894/21791/21776"
    },
    {
        name: "IFPRO INV CNV 350 ILLUSIA STEEL(2S)-TL",
        image: "image_url_here",
        category: "Refrigerators",
        price: 72024.30, // MRP - 10%
        mrp: 80027,
        brand: "Whirlpool",
        keywords: ["IFPRO", "INV", "CNV", "350", "Illusia Steel", "2S"],
        capacity: "350 L",
        description: "Premium fridge in Illusia Steel finish with a 350L capacity.",
        model: "21674"
    },
    {
        name: "IFPRO INV CNV 375 OMEGA BLACK(2S)-TL",
        image: "image_url_here",
        category: "Refrigerators",
        price: 79753.50, // MRP - 10%
        mrp: 88615,
        brand: "Whirlpool",
        keywords: ["IFPRO", "INV", "CNV", "375", "Omega Black", "2S"],
        capacity: "375 L",
        description: "Large capacity fridge in sleek Omega Black finish for modern kitchens.",
        model: "21852"
    },
    {
        name: "IF INV CNV 455 ALPHA STEEL (2S)-Z",
        image: "image_url_here",
        category: "Refrigerators",
        price: 114085.80, // MRP - 10%
        mrp: 126762,
        brand: "Whirlpool",
        keywords: ["IF", "INV", "CNV", "455", "Alpha Steel", "2S"],
        capacity: "455 L",
        description: "Spacious and modern fridge in Alpha Steel, perfect for large families.",
        model: "21690"
    },
    {
        name: "IF INV CNV 480 ALPHA STEEL (2S)-Z",
        image: "image_url_here",
        category: "Refrigerators",
        price: 126273.60, // MRP - 10%
        mrp: 140304,
        brand: "Whirlpool",
        keywords: ["IF", "INV", "CNV", "480", "Alpha Steel", "2S"],
        capacity: "480 L",
        description: "Large capacity 480L fridge in sleek Alpha Steel finish for modern kitchens.",
        model: "21692"
    },
    {
        name: "IF INV CNV 515 ALPHA STEEL (2S)-Z",
        image: "image_url_here",
        category: "Refrigerators",
        price: 130732.20, // MRP - 10%
        mrp: 145258,
        brand: "Whirlpool",
        keywords: ["IF", "INV", "CNV", "515", "Alpha Steel", "2S"],
        capacity: "515 L",
        description: "Premium 515L fridge in Alpha Steel for large families and modern homes.",
        model: "21695"
    },
    {
        name: "FP 263D PROTTON ROY COOL ILLUSIA/ALPHA STEEL/ONYX (N)",
        image: "image_url_here",
        category: "Refrigerators",
        price: 56121.30, // MRP - 10%
        mrp: 62357,
        brand: "Whirlpool",
        keywords: ["FP", "263D", "Prottton", "Roy Cool", "Illusia", "Alpha Steel", "Onyx", "3D"],
        capacity: "263 L",
        description: "Triple door fridge with a combination of Illusia, Alpha Steel, and Onyx finishes.",
        model: "21314/20807/21145"
    },
    {
        name: "FP 283D PROTTON ROY COOL ILLUSIA/ALPHA STEEL/ONYX (N)",
        image: "image_url_here",
        category: "Refrigerators",
        price: 58588.20, // MRP - 10%
        mrp: 65098,
        brand: "Whirlpool",
        keywords: ["FP", "283D", "Prottton", "Roy Cool", "Illusia", "Alpha Steel", "Onyx", "3D"],
        capacity: "283 L",
        description: "Triple door fridge with modern Illusia and Alpha Steel finishes.",
        model: "21316/20812"
    },
    {
        name: "FP 343D PROTTON ROY ALPHA STEEL (Z)",
        image: "image_url_here",
        category: "Refrigerators",
        price: 69201.00, // MRP - 10%
        mrp: 76890,
        brand: "Whirlpool",
        keywords: ["FP", "343D", "Prottton", "Roy", "Alpha Steel", "3D"],
        capacity: "343 L",
        description: "Triple door fridge in Alpha Steel finish, perfect for modern kitchens.",
        model: "20817"
    },
    {
        name: "WS SBS 570 STEEL (SH)",
        image: "image_url_here",
        category: "Refrigerators",
        price: 157484.70, // MRP - 10%
        mrp: 174983,
        brand: "Whirlpool",
        keywords: ["WS", "SBS", "570", "Steel", "SH", "Side by Side"],
        capacity: "570 L",
        description: "Premium Side by Side fridge with Steel finish, ideal for large families.",
        model: "21195"
    },
    {
        name: "ACE 6.5 SUPREME PLUS (CORAL RED) (5YR)",
        image: "image_url_here",
        category: "WashingMachines",
        price: 25097.40, // MRP - 10%
        mrp: 27886,
        brand: "Whirlpool",
        keywords: ["ACE", "6.5", "Supreme Plus", "Coral Red", "5YR"],
        capacity: "6.5 kg",
        description: "Top load washing machine in Coral Red with 5-year warranty, ideal for small families.",
        model: "SA 30254"
    },
    {
        name: "SUPERB ATOM 70I GREY DAZZLE (5YR)",
        image: "image_url_here",
        category: "WashingMachines",
        price: 25097.40, // MRP - 10%
        mrp: 27886,
        brand: "Whirlpool",
        keywords: ["Superb", "Atom", "70I", "Grey Dazzle", "5YR"],
        capacity: "7.0 kg",
        description: "Grey Dazzle model with 7.0 kg capacity and 5-year warranty for reliable washing.",
        model: "SA 30294"
    },
    {
        name: "ACE 7.0 SUP SOAK (GREY) (5YR)",
        image: "image_url_here",
        category: "WashingMachines",
        price: 26027.10, // MRP - 10%
        mrp: 28919,
        brand: "Whirlpool",
        keywords: ["ACE", "7.0", "Sup Soak", "Grey", "5YR"],
        capacity: "7.0 kg",
        description: "7.0 kg top load washing machine with super soak function and 5-year warranty.",
        model: "SA 30299"
    },
    {
        name: "ACE 7.5 SUPER SOAK WINE DAZZLE (10 YR)",
        image: "image_url_here",
        category: "WashingMachines",
        price: 28196.10, // MRP - 10%
        mrp: 31329,
        brand: "Whirlpool",
        keywords: ["ACE", "7.5", "Super Soak", "Wine Dazzle", "10YR"],
        capacity: "7.5 kg",
        description: "Wine Dazzle colored washing machine with super soak function and 10-year warranty.",
        model: "SA 30274"
    },
    {
        name: "ACE 8.0 SUPERSOAK (CORAL PURPLE) (5YR)-N",
        image: "image_url_here",
        category: "WashingMachines",
        price: 29745.90, // MRP - 10%
        mrp: 33051,
        brand: "Whirlpool",
        keywords: ["ACE", "8.0", "Supersoak", "Coral Purple", "5YR"],
        capacity: "8.0 kg",
        description: "Coral Purple top load washing machine with SuperSoak technology and 5-year warranty.",
        model: "SA 30276"
    },
    {
        name: "SUPERSOAK - 8.0KG, 3D PACE OPP IMPELLER",
        image: "image_url_here",
        category: "WashingMachines",
        price: 29745.90, // MRP - 10%
        mrp: 33051,
        brand: "Whirlpool",
        keywords: ["Supersoak", "8.0 kg", "3D Pace Opp Impeller"],
        capacity: "8.0 kg",
        description: "8.0 kg washing machine with 3D Pace Opp Impeller for enhanced wash performance.",
        model: "SA 30275"
    },
    {
        name: "ACE XL 10 DMIX GRAPHITE GREY(10YR)",
        image: "image_url_here",
        category: "WashingMachines",
        price: 38886.30, // MRP - 10%
        mrp: 43207,
        brand: "Whirlpool",
        keywords: ["ACE XL", "10", "DMIX", "Graphite Grey", "10YR"],
        capacity: "10.0 kg",
        description: "Large capacity 10.0 kg washing machine in Graphite Grey with 10-year warranty.",
        model: "SA 30343"
    },
    {
        name: "WM CLASSIC 6.5 GENX GREY 10YMW",
        image: "image_url_here",
        category: "WashingMachines",
        price: 34703.10, // MRP - 10%
        mrp: 38559,
        brand: "Whirlpool",
        keywords: ["WM", "Classic", "6.5", "GenX", "Grey", "10YMW"],
        capacity: "6.5 kg",
        description: "Classic 6.5 kg washing machine with GenX technology and a 10-year motor warranty.",
        model: "FATL 31465"
    },
    {
        name: "WM CLASSIC 7.0 GENX GREY 10YMW (MT)",
        image: "image_url_here",
        category: "WashingMachines",
        price: 35942.40, // MRP - 10%
        mrp: 39936,
        brand: "Whirlpool",
        keywords: ["WM", "Classic", "7.0", "GenX", "Grey", "10YMW"],
        capacity: "7.0 kg",
        description: "7.0 kg washing machine with GenX technology and 10-year motor warranty.",
        model: "FATL 31616"
    },
    {
        name: "SW PRO PLUS 7.0 KG MIDNIGHT GREY 10YMW",
        image: "image_url_here",
        category: "WashingMachines",
        price: 43224.30, // MRP - 10%
        mrp: 48027,
        brand: "Whirlpool",
        keywords: ["SW", "Pro Plus", "7.0 kg", "Midnight Grey", "10YMW"],
        capacity: "7.0 kg",
        description: "7.0 kg washing machine with Pro Plus technology and Midnight Grey color.",
        model: "FATL 31554"
    },
    {
        name: "WHITEMAGIC ELITE 7.5 GREY 10YMW",
        image: "image_url_here",
        category: "WashingMachines",
        price: 39405.50, // MRP - 10%
        mrp: 43895,
        brand: "Whirlpool",
        keywords: ["Whitemagic", "Elite", "7.5 kg", "Grey", "10YMW"],
        capacity: "7.5 kg",
        description: "Whitemagic Elite washing machine with a capacity of 7.5 kg and 10-year motor warranty.",
        model: "FATL 31370"
    },
    {
        name: "WHITEMAGIC ELITE PLUS 7.5 GREY 10YMW",
        image: "image_url_here",
        category: "WashingMachines",
        price: 42294.60, // MRP - 10%
        mrp: 46994,
        brand: "Whirlpool",
        keywords: ["Whitemagic", "Elite Plus", "7.5 kg", "Grey", "10YMW"],
        capacity: "7.5 kg",
        description: "Whitemagic Elite Plus model with enhanced features and 7.5 kg capacity.",
        model: "FATL 31600"
    },
    {
        name: "STAINWASH PRO H 7.5 KG GREY 10YRMW",
        image: "image_url_here",
        category: "WashingMachines",
        price: 42294.60, // MRP - 10%
        mrp: 46994,
        brand: "Whirlpool",
        keywords: ["Stainwash", "Pro H", "7.5 kg", "Grey", "10YRMW"],
        capacity: "7.5 kg",
        description: "High performance Stainwash Pro H washing machine with 7.5 kg capacity.",
        model: "FATL 31631"
    },
    {
        name: "STAINWASH PRO H 7.5 KG GREY 10YMW",
        image: "image_url_here",
        category: "WashingMachines",
        price: 44773.20, // MRP - 10%
        mrp: 49748,
        brand: "Whirlpool",
        keywords: ["Stainwash", "Pro H", "7.5 kg", "Grey", "10YMW"],
        capacity: "7.5 kg",
        description: "Stainwash Pro H for advanced stain removal and superior washing with 7.5 kg capacity.",
        model: "FATL 31556"
    },
    {
        name: "SW PRO PLUS H 7.5 KG MIDNIGHT GREY 1YMW",
        image: "image_url_here",
        category: "WashingMachines",
        price: 47561.40, // MRP - 10%
        mrp: 52846,
        brand: "Whirlpool",
        keywords: ["SW", "Pro Plus H", "7.5 kg", "Midnight Grey", "1YMW"],
        capacity: "7.5 kg",
        description: "Midnight Grey SW Pro Plus H model with 7.5 kg capacity and 1-year motor warranty.",
        model: "FATL 31558"
    },
    {
        name: "STAINWASH PRO H 8.0 KG GREY 10YRMW",
        image: "image_url_here",
        category: "WashingMachines",
        price: 44773.20, // MRP - 10%
        mrp: 49748,
        brand: "Whirlpool",
        keywords: ["Stainwash", "Pro H", "8.0 kg", "Grey", "10YRMW"],
        capacity: "8.0 kg",
        description: "Stainwash Pro H with 8.0 kg capacity, designed to fight tough stains.",
        model: "FATL 31635"
    },
    {
        name: "360 BW PRO H 8 KG GRAPHITE 10YMW",
        image: "image_url_here",
        category: "WashingMachines",
        price: 51930.90, // MRP - 10%
        mrp: 57701,
        brand: "Whirlpool",
        keywords: ["360 BW", "Pro H", "8 kg", "Graphite", "10YMW"],
        capacity: "8.0 kg",
        description: "Graphite-colored 360 BW Pro H washing machine with 8.0 kg capacity and 10-year motor warranty.",
        model: "FATL 31670"
    },
    {
        name: "SW PRO PLUS H 8.5 KG MIDNIGHT GREY 10YRM",
        image: "image_url_here",
        category: "WashingMachines",
        price: 47561.40, // MRP - 10%
        mrp: 52846,
        brand: "Whirlpool",
        keywords: ["SW", "Pro Plus H", "8.5 kg", "Midnight Grey", "10YRM"],
        capacity: "8.5 kg",
        description: "High capacity washing machine with 8.5 kg and Pro Plus H technology.",
        model: "FATL 31639"
    },
    {
        name: "360 BW PRO (540) H 8.5 MIDNIGHT GREY 10YMW",
        image: "image_url_here",
        category: "WashingMachines",
        price: 53604.00, // MRP - 10%
        mrp: 59560,
        brand: "Whirlpool",
        keywords: ["360 BW", "Pro", "540", "8.5", "Midnight Grey", "10YMW"],
        capacity: "8.5 kg",
        description: "8.5 kg washing machine with 540 RPM and 10-year motor warranty.",
        model: "FATL 31601/31671"
    },
    {
        name: "360 BW PRO (540) H 9.0 MIDNIGHT GREY 10YMW",
        image: "image_url_here",
        category: "WashingMachines",
        price: 55152.90, // MRP - 10%
        mrp: 61281,
        brand: "Whirlpool",
        keywords: ["360 BW", "Pro", "540", "9.0", "Midnight Grey", "10YMW"],
        capacity: "9.0 kg",
        description: "9.0 kg top load washing machine with 540 RPM and 10-year motor warranty.",
        model: "FATL 31602"
    },
    {
        name: "7 KG LED+TOUCH 1200 RPM INV MAJESTIC SILVER (3 YR WRNT)",
        image: "image_url_here",
        category: "WashingMachines",
        price: 70955.10, // MRP - 10%
        mrp: 78839,
        brand: "Whirlpool",
        keywords: ["7 KG", "LED+Touch", "1200 RPM", "Majestic Silver", "3 YR WRNT"],
        capacity: "7.0 kg",
        description: "LED+Touch washing machine with 7.0 kg capacity and 1200 RPM, in Majestic Silver.",
        model: "FLT 33010"
    },
    {
        name: "7 KG LED+TOUCH 1200 RPM INV VOLCANO GREY (3 YR WRNT)",
        image: "image_url_here",
        category: "WashingMachines",
        price: 71575.20, // MRP - 10%
        mrp: 79528,
        brand: "Whirlpool",
        keywords: ["7 KG", "LED+Touch", "1200 RPM", "Volcano Grey", "3 YR WRNT"],
        capacity: "7.0 kg",
        description: "Stylish Volcano Grey LED+Touch washing machine with 7.0 kg capacity and 1200 RPM.",
        model: "FLT 33009"
    },
    {
        name: "8 KG LED+TOUCH 1400 RPM INV MAJESTIC SILVER (3 YR WRNT)",
        image: "image_url_here",
        category: "WashingMachines",
        price: 78701.40, // MRP - 10%
        mrp: 87446,
        brand: "Whirlpool",
        keywords: ["8 KG", "LED+Touch", "1400 RPM", "Majestic Silver", "3 YR WRNT"],
        capacity: "8.0 kg",
        description: "8.0 kg washing machine with LED+Touch interface, 1400 RPM, and 3-year warranty.",
        model: "FLT 33017"
    },
    {
        name: "8 KG LED+TOUCH 1400 RPM INV MAJESTIC SILVER O3 (3 YR WRNT)",
        image: "image_url_here",
        category: "WashingMachines",
        price: 80560.80, // MRP - 10%
        mrp: 89512,
        brand: "Whirlpool",
        keywords: ["8 KG", "LED+Touch", "1400 RPM", "Majestic Silver O3", "3 YR WRNT"],
        capacity: "8.0 kg",
        description: "8.0 kg washing machine with advanced LED+Touch technology, 1400 RPM, and 3-year warranty.",
        model: "FLT 33015"
    },
    {
        name: "8 KG LCD 1400 RPM DD VOLCANO GREY O3 RC PUMP (3 YR WRNT)",
        image: "image_url_here",
        category: "WashingMachines",
        price: 84433.50, // MRP - 10%
        mrp: 93815,
        brand: "Whirlpool",
        keywords: ["8 KG", "LCD", "1400 RPM", "Volcano Grey", "O3", "RC Pump", "3 YR WRNT"],
        capacity: "8.0 kg",
        description: "8.0 kg LCD washing machine with 1400 RPM, Volcano Grey, O3 technology, and RC pump.",
        model: "FLT 33016"
    },
    {
        name: "8 KG LCD 1400 RPM DD MAJESTIC SILVER O3 RC PUMP (3 YR WRNT)",
        image: "image_url_here",
        category: "WashingMachines",
        price: 88518.50, // MRP - 10%
        mrp: 98465,
        brand: "Whirlpool",
        keywords: ["8 KG", "LCD", "1400 RPM", "Majestic Silver", "O3", "RC Pump", "3 YR WRNT"],
        capacity: "8.0 kg",
        description: "8.0 kg LCD washing machine with 1400 RPM, Majestic Silver, O3 technology, and RC pump.",
        model: "FLT 33018"
    },
    {
        name: "CF 145 CHEST FREEZER",
        image: "image_url_here",
        category: "ChestFreezer",
        price: 33660, // MRP - 10%
        mrp: 37400,
        brand: "Whirlpool",
        keywords: ["Chest Freezer", "CF 145", "145 L", "Freezer"],
        capacity: "145 L",
        description: "145L Chest Freezer with energy-efficient technology and large storage capacity.",
        model: "CFW 145"
    },
    {
        name: "CF 200 CHEST FREEZER",
        image: "image_url_here",
        category: "ChestFreezer",
        price: 38890, // MRP - 10%
        mrp: 43100,
        brand: "Whirlpool",
        keywords: ["Chest Freezer", "CF 200", "200 L", "Freezer"],
        capacity: "200 L",
        description: "200L Chest Freezer offering high storage capacity and reliable cooling performance.",
        model: "CFW 200"
    },
    {
        name: "CF 316 CHEST FREEZER",
        image: "image_url_here",
        category: "ChestFreezer",
        price: 50950, // MRP - 10%
        mrp: 56500,
        brand: "Whirlpool",
        keywords: ["Chest Freezer", "CF 316", "316 L", "Freezer"],
        capacity: "316 L",
        description: "316L Chest Freezer providing ample space for large storage needs and energy efficiency.",
        model: "CFW 316"
    },
    {
        name: "CF 380 CHEST FREEZER",
        image: "image_url_here",
        category: "ChestFreezer",
        price: 62550, // MRP - 10%
        mrp: 69500,
        brand: "Whirlpool",
        keywords: ["Chest Freezer", "CF 380", "380 L", "Freezer"],
        capacity: "380 L",
        description: "380L Chest Freezer designed for maximum storage capacity and optimal freezing performance.",
        model: "CFW 380"
    },
    {
        name: "MAGICOOK PRO 20SE BLACK",
        image: "image_url_here",
        category: "KitchenAppliances",
        price: 12600, // MRP - 10%
        mrp: 14000,
        brand: "Whirlpool",
        keywords: ["Microwave", "MAGICOOK PRO 20SE", "Black", "20L"],
        capacity: "20L",
        description: "Magicoook Pro 20SE with advanced features and a sleek black design.",
        model: "50047"
    },
    {
        name: "MW 20 BC",
        image: "image_url_here",
        category: "KitchenAppliances",
        price: 17640, // MRP - 10%
        mrp: 19600,
        brand: "Whirlpool",
        keywords: ["Microwave", "MW 20 BC", "20L", "Black"],
        capacity: "20L",
        description: "Compact and powerful MW 20 BC microwave with excellent cooking performance.",
        model: "13904"
    },
    {
        name: "MAGICOOK PRO 25GE BLACK",
        image: "image_url_here",
        category: "KitchenAppliances",
        price: 15300, // MRP - 10%
        mrp: 17000,
        brand: "Whirlpool",
        keywords: ["Microwave", "MAGICOOK PRO 25GE", "Black", "25L"],
        capacity: "25L",
        description: "Magicoook Pro 25GE offers exceptional cooking features with a 25L capacity.",
        model: "50050"
    },
    {
        name: "MAGICOOK PRO 26CE BLACK",
        image: "image_url_here",
        category: "KitchenAppliances",
        price: 20160, // MRP - 10%
        mrp: 22400,
        brand: "Whirlpool",
        keywords: ["Microwave", "MAGICOOK PRO 26CE", "Black", "26L"],
        capacity: "26L",
        description: "Magicoook Pro 26CE with versatile cooking options and a sleek black finish.",
        model: "50052"
    },
    {
        name: "MAGICOOK PRO 30SE BLACK",
        image: "image_url_here",
        category: "KitchenAppliances",
        price: 15750, // MRP - 10%
        mrp: 17500,
        brand: "Whirlpool",
        keywords: ["Microwave", "MAGICOOK PRO 30SE", "Black", "30L"],
        capacity: "30L",
        description: "Magicoook Pro 30SE with large capacity and powerful features for all your cooking needs.",
        model: "50049"
    },
    {
        name: "MAGICOOK 30L BLACK MIRROR",
        image: "image_url_here",
        category: "KitchenAppliances",
        price: 30240, // MRP - 10%
        mrp: 33600,
        brand: "Whirlpool",
        keywords: ["Microwave", "MAGICOOK", "30L", "Black Mirror"],
        capacity: "30L",
        description: "Magicoook 30L Black Mirror microwave for stylish and efficient cooking.",
        model: "50039"
    }
];



module.exports = products;
