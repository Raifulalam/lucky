const jwt = require("jsonwebtoken");
const Employee = require("../../Models/Employee");

function signToken(employee) {
    return jwt.sign(
        {
            id: employee._id,
            name: employee.name,
            email: employee.email,
            role: employee.role,
            employeeCode: employee.employeeCode,
        },
        process.env.JWT_SECRET || "change-me-in-env",
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );
}

function sanitizeEmployee(employee) {
    return employee?.toSafeObject ? employee.toSafeObject() : employee;
}

async function setupAdmin(req, res) {
    try {
        const existingAdmin = await Employee.countDocuments({ role: "admin" });
        if (existingAdmin > 0) {
            return res.status(400).json({
                success: false,
                message: "An admin account already exists. Use the login route instead.",
            });
        }

        const admin = await Employee.create({
            ...req.body,
            role: "admin",
            status: "active",
        });

        return res.status(201).json({
            success: true,
            message: "Admin account created successfully.",
            employee: sanitizeEmployee(admin),
            token: signToken(admin),
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;
        const employee = await Employee.findOne({ email: String(email).toLowerCase().trim() });

        if (!employee) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }

        const isMatch = await employee.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }

        employee.lastLoginAt = new Date();
        await employee.save();

        return res.json({
            success: true,
            token: signToken(employee),
            employee: sanitizeEmployee(employee),
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function getMe(req, res) {
    try {
        const employee = await Employee.findById(req.user.id)
            .select("-password")
            .populate("manager", "name employeeCode email");

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found." });
        }

        return res.json({ success: true, employee });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function updateMyProfile(req, res) {
    try {
        const allowedUpdates = [
            "name",
            "phone",
            "alternatePhone",
            "dateOfBirth",
            "gender",
            "address",
            "emergencyContact",
        ];

        const payload = allowedUpdates.reduce((accumulator, key) => {
            if (req.body[key] !== undefined) {
                accumulator[key] = req.body[key];
            }
            return accumulator;
        }, {});

        const employee = await Employee.findByIdAndUpdate(req.user.id, payload, {
            new: true,
            runValidators: true,
        }).select("-password");

        return res.json({
            success: true,
            message: "Profile updated successfully.",
            employee,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function changePassword(req, res) {
    try {
        const { currentPassword, newPassword } = req.body;
        const employee = await Employee.findById(req.user.id);

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found." });
        }

        const isMatch = await employee.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Current password is incorrect." });
        }

        employee.password = newPassword;
        await employee.save();

        return res.json({ success: true, message: "Password updated successfully." });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

async function uploadAvatar(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Please upload a profile image." });
        }

        const avatar = `/uploads/hrms/profiles/${req.file.filename}`;
        const employee = await Employee.findByIdAndUpdate(
            req.user.id,
            { avatar },
            { new: true }
        ).select("-password");

        return res.json({
            success: true,
            message: "Profile photo uploaded successfully.",
            employee,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    setupAdmin,
    login,
    getMe,
    updateMyProfile,
    changePassword,
    uploadAvatar,
};
