const mongoose = require('mongoose');
const products = [
    {

        image: "image/doubledoor/9D5A8F698D4550F-RT28A32216U.png",
        name: "RT28A32216R Samsung Double Door Refrigerator with Digital Inverter Technology, 253L",
        link: "details.html",
        details: "Refrigerator of 100l Samsung 22452",
        rating: {
            stars: 4.5,
            count: 87
        },
        mrp: 60990,
        price: 51000,
        keywords: [
            "doubledoor", "rt28a32216r", "253", "refrigerator", "samsung",
        ]
    },
    {

        image: "image/doubledoor/1ECB5DF2089DD3E-RT28A32216R.png",
        name: "RT28A32216R Samsung Double Door Refrigerator with Digital Inverter Technology, 253L",
        link: "details.html",
        details: "refrigerator of 100l samsung 22452",
        rating: {
            stars: 4.5,
            count: 87
        },
        mrp: 60990,
        price: 51000,
        keywords: [
            "doubledoor",
            "rt28a32216r",
            "253",
            "refrigerator",
            "samsung",
        ]
    },
    {

        image: "image/doubledoor/9D5A8F698D4550F-RT28A32216U.png",
        name: "RT28A32216U Samsung Double Door Refrigerator with Digital Inverter Technology, 253L",
        rating: {
            stars: 4,
            count: 127
        },
        mrp: 60990,
        price: 51000,
        keywords: [
            "doubledoor",
            "rt28a32216u",
            "253",
            "refrigerator",
            "samsung",
        ]
    },
    {
        id: "83d4ca15-0f35-48f5-b7a3-1ea210004f2e",
        image: "image/doubledoor/11D12E847973D5A-RT28C3221CR.png",
        name: "RT28C3221CR Samsung Double Door Refrigerator, 253L",
        rating: {
            stars: 4.5,
            count: 56
        },
        mrp: 61990,
        price: 51500,
        keywords: [
            "doubledoor",
            "rt28a3221cr",
            "253",
            "refrigerator",
            "samsung",
        ],

    },
    {
        id: "54e0eccd-8f36-462b-b68a-8182611d9add",
        image: "image/doubledoor/11DEAB55E1C3117-RT37C4521S8.png",
        name: "RT37C4521S8 Samsung Double Door Refrigerator, 345L",
        rating: {
            stars: 5,
            count: 219
        },
        mrp: 84990,
        price: 71000,
        keywords: [
            "doubledoor",
            "rt37c4521s8",
            "345",
            "refrigerator",
            "samsung",
        ]
    },
    {
        id: "3ebe75dc-64d2-4137-8860-1f5a963e534b",
        image: "image/doubledoor/A99F06C790B076B-RT28A3022GS.png",
        name: "RT28A3022GS Samsung Double Door Refrigerator with Digital Inverter Technology, 253L",
        rating: {
            stars: 4,
            count: 37
        },
        mrp: 56490,
        price: 46500,
        keywords: [
            "doubledoor",
            "rt28a3022gs",
            "253",
            "refrigerator",
            "samsung",
        ]
    },
    {
        id: "8c9c52b5-5a19-4bcb-a5d1-158a74287c53",
        image: "image/doubledoor/AF918959F338CE2-RT28C3221CU.png",
        name: "RT28C3221CU Samsung Double Door Refrigerator, 253L",
        rating: {
            stars: 4.5,
            count: 175
        },
        mrp: 61990,
        price: 51500,
        keywords: [
            "doubledoor",
            "rt28c3221cu",
            "253",
            "refrigerator",
            "samsung",
        ]
    },
    {
        id: "dd82ca78-a18b-4e2a-9250-31e67412f98d",
        image: "image/doubledoor/F889302D3166DF5-RT30K3342S8.png",
        name: "RT30K3342S8 Samsung Double Door Refrigerator, 275L",
        rating: {
            stars: 4.5,
            count: 317
        },
        mrp: 67990,
        price: 55500,
        keywords: [
            "doubledoor",
            "rt30k3342s8",
            "275",
            "refrigerator",
            "samsung",

        ]
    },
    //single door
    {
        id: "77919bbe-0e56-475b-adde-4f24dfed3a04",
        image: "image/Single-door/1DA2BEA520BC02C-RR20C20C2RH.png",
        name: "RR20C20C2RH Samsung Single Door Refrigerator, 192L",
        rating: {
            stars: 4.5,
            count: 144
        },
        mrp: 32990,
        price: 27500,
        keywords: [
            "singledoor",
            "192",
            "refrigerator",
            "rr20c20c2rh",
            "samsung",

        ]
    },
    {
        id: "3fdfe8d6-9a15-4979-b459-585b0d0545b9",
        image: "image/Single-door/2A2CA29862D7AB6-RR20T282ZR8.png",
        name: "RR20T282ZR8 Samsung Single Door Refrigerator with Digital Inverter Compressor, 192L",
        rating: {
            stars: 4.5,
            count: 305
        },
        mrp: 41990,
        price: 36000,
        keywords: [
            "singledoor",
            "192",
            "refrigerator",
            "rr20t282zr8",
            "samsung",
        ]
    },
    {
        id: "58b4fc92-e98c-42aa-8c55-b6b79996769a",
        image: "image/Single-door/7F470F4B6BA5539-RR20C2Z226U.png",
        name: "RR20C2Z226U Samsung Single Door Refrigerator, 192L",
        rating: {
            stars: 4,
            count: 89
        },
        mrp: 39590,
        price: 33500,
        keywords: [
            "singledoor",
            "192",
            "refrigerator",
            "rr20c2z226u",
            "samsung",
        ]
    },
    {
        id: "5968897c-4d27-4872-89f6-5bcb052746d7",
        image: "image/Single-door/8E7A9442734E2F4-RR20C2Z226R.png",
        name: "RR20C2Z226R Samsung Single Door Refrigerator, 192L",
        rating: {
            stars: 4.5,
            count: 235
        },
        mrp: 39590,
        price: 33500,
        keywords: [
            "singledoor",
            "192",
            "refrigerator",
            "rr20c2z226r",
            "samsung",
        ],

    },
    {
        id: "aad29d11-ea98-41ee-9285-b916638cac4a",
        image: "image/Single-door/563F7C13FC6004D-RR20M282ZS8.png",
        name: "RR20M282ZS8 Samsung Single Door Refrigerator with Digital Inverter Technology, 192L",
        rating: {
            stars: 4.5,
            count: 30
        },
        mrp: 38990,
        price: 33000,
        keywords: [
            "singledoor",
            "192",
            "refrigerator",
            "rr20m282zs8",
            "samsung",
        ]
    },
    {
        id: "04701903-bc79-49c6-bc11-1af7e3651358",
        image: "image/Single-door/757D53379073106-RR20C2412S8.png",
        name: "RR20C2412S8 Samsung Single Door Refrigerator, 192L",
        rating: {
            stars: 4.5,
            count: 562
        },
        mrp: 36990,
        price: 31500,
        keywords: [
            "singledoor",
            "192",
            "refrigerator",
            "rr20c2412s8",
            "samsung",
        ]
    },
    {
        id: "901eb2ca-386d-432e-82f0-6fb1ee7bf969",
        image: "image/Single-door/857BCE683515D79-RR20C2722CR.png",
        name: "RR20C2722CR Samsung Single Door Refrigerator, 192L",
        rating: {
            stars: 4.5,
            count: 232
        },
        mrp: 37990,
        price: 32500,
        keywords: [
            "singledoor",
            "192",
            "refrigerator",
            "rr20c2722cr",
            "samsung",
        ]
    },
    {
        id: "82bb68d7-ebc9-476a-989c-c78a40ee5cd9",
        image: "image/Single-door/5744E605DA3F99D-RR20C2722CU.png",
        name: "RR20C2722CU Samsung Single Door Refrigerator, 192L",
        rating: {
            stars: 4,
            count: 160
        },
        mrp: 37990,
        price: 32500,
        keywords: [
            "singledoor",
            "192",
            "refrigerator",
            "rr20c2722cu",
            "samsung",
        ]
    },

    {
        id: "6b07d4e7-f540-454e-8a1e-363f25dbae7d",
        image: "image/Single-door/8071322C7EC07CC-RR20C20C2GS.png",
        name: "RR20C20C2GS Samsung Single Door Refrigerator, 192L",
        rating: {
            stars: 4,
            count: 99
        },
        mrp: 33490,
        price: 28500,
        keywords: [
            "singledoor",
            "192",
            "refrigerator",
            "rr20c20c2gs",
            "samsung",
        ]
    },
    {
        id: "e4f64a65-1377-42bc-89a5-e572d19252e2",
        image: "image/Single-door/E3EAF0181A3C8AB-RR20T282ZU8.png",
        name: "RR20T282ZU8 Samsung Single Door Refrigerator with Digital Inverter Compressor, 192L",
        rating: {
            stars: 4.5,
            count: 52
        },
        mrp: 41990,
        price: 36000,
        keywords: [
            "singledoor",
            "192",
            "refrigerator",
            "rr20t282zu8",
            "samsung",
        ]
    },

    // Add the rest of the products
];

module.exports = products;


