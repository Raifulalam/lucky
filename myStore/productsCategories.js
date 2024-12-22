const mongoose = require('mongoose');

const productCategories = [
    {
        name: "AirConditioners",
        description: "Keep your space cool and comfortable with our energy-efficient air conditioners from trusted brands.",
        icon: "🌬️",
    },
    {
        name: "WashingMachines",
        description: "Efficient and durable washing machines to make laundry easier and faster, with modern features.",
        icon: "🧺",
    },
    {
        name: "Refrigerators",
        description: "High-performance refrigerators designed to preserve your food fresh for longer, with sleek designs.",
        icon: "❄️",
    },
    {
        name: "LEDTelevisions",
        description: "Experience stunning visuals and immersive sound with our range of high-quality LED televisions.",
        icon: "📺",
    },
    {
        name: "KitchenAppliances",
        description: "Innovative and practical kitchen gadgets to help you prepare delicious meals with ease.",
        icon: "🍳",
    },
    {
        name: "HomeAppliances",
        description: "A wide variety of home appliances that bring convenience and efficiency to your daily life.",
        icon: "🏡",
    },
];

module.exports = productCategories;