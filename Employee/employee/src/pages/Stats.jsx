import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const data = [
    { name: "Present Days", value: 20 },
    { name: "Absent Days", value: 2 },
    { name: "Leaves", value: 3 },
];

const COLORS = ["#4caf50", "#f44336", "#ff9800"];

export default function Stats() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Work Stats</h1>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
