import { useEffect, useState } from "react";

export default function Dashboard() {
    const [employee, setEmployee] = useState([]);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await fetch("https://lucky-back.onrender.com/api/employees");
                const data = await response.json();
                setEmployee(data);
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };

        fetchEmployees();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Employee Dashboard</h1>
            <p>Welcome! From here you can see your stats, attendance, and salary.</p>

            <h2 className="text-xl font-semibold mt-4">Employees</h2>
            <ul className="list-disc ml-6">
                {employee.length > 0 ? (
                    employee.map((emp, index) => (
                        <li key={index}>
                            {emp.name} — {emp.position}
                        </li>
                    ))
                ) : (
                    <p>Loading employees...</p>
                )}
            </ul>
        </div>
    );
}
