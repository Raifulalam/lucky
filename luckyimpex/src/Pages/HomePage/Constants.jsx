import { Truck, ShieldCheck, Percent, Star } from "lucide-react";

import luckyImage from "../../Images/backimg.webp";
import backimg from "../../Images/backimg1.webp";
import back01 from "../../Images/backimg2.webp";
import back02 from "../../Images/backimg3.webp";
import back03 from "../../Images/backimg4.webp";
import back04 from "../../Images/backimg6.webp";
import back05 from "../../Images/backimg7.webp";
import back06 from "../../Images/backimg5.webp";
export const images = [
    luckyImage,
    backimg,
    back02,
    back01,
    back03,
    back04,
    back05,
    back06,
];


export const categories = [
    { name: "AirConditioners", description: "Keep your space cool with energy-efficient ACs.", icon: "❄️" },
    { name: "Refrigerators", description: "High-performance refrigerators with sleek designs.", icon: "🧊" },
    { name: "WashingMachines", description: "Efficient washing machines with modern features.", icon: "🧺" },
    { name: "LEDTelevisions", description: "Stunning visuals & immersive sound TVs.", icon: "📺" },
    { name: "KitchenAppliances", description: "Smart kitchen gadgets to make cooking easy.", icon: "🍳" },
    { name: "Chimney", description: "Promotes healthy living with clean air.", icon: "🏠" },
    { name: "HomeAppliances", description: "Everyday essentials for home convenience.", icon: "🛋️" },
    { name: "HomeTheater", description: "Cinematic experience at home.", icon: "🎬" },
    { name: "AirCooler", description: "Affordable coolers for every need.", icon: "💨" },
    { name: "ChestFreezer", description: "Keep your food fresh & healthy.", icon: "🥶" },
];

export const brands = [
    "LG", "Samsung", "Whirlpool", "Haier", "CG", "Videocon", "Skyworth", "Symphony", "Bajaj"
];

export const benefits = [
    { icon: <Truck size={40} />, title: "Fast Shipping", text: "Quick and reliable delivery." },
    { icon: <ShieldCheck size={40} />, title: "Trusted Quality", text: "Warranty & reliable products." },
    { icon: <Percent size={40} />, title: "Exclusive Offers", text: "Deals & discounts every week." },
    { icon: <Star size={40} />, title: "Customer Satisfaction", text: "Rated highly by our customers." },
];
