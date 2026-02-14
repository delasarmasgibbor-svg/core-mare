"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createStaff(formData) {
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const role = formData.get("role") || "STAFF";
    const type = formData.get("type") || "FULL_TIME";
    const preferredShift = formData.get("preferredShift") || "";
    const maxWeeklyHours = formData.get("maxWeeklyHours") ? parseInt(formData.get("maxWeeklyHours")) : 40;

    if (!email || !password || !name) {
        throw new Error("Missing required fields");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                employmentType: type,
                preferredShift,
                maxWeeklyHours,
            },
        });
        revalidatePath("/staff");
        revalidatePath("/roster");
        return { success: true, user };
    } catch (error) {
        console.error("Error creating staff:", error);
        return { error: error.message || "Failed to create staff" };
    }
}

export async function deleteStaff(id) {
    try {
        await prisma.user.delete({
            where: { id },
        });
        revalidatePath("/staff");
        revalidatePath("/roster");
        return { success: true };
    } catch (error) {
        console.error("Error deleting staff:", error);
        return { error: "Failed to delete staff" };
    }
}

export async function updateStaffPreference(id, preferredShift) {
    try {
        await prisma.user.update({
            where: { id },
            data: { preferredShift },
        });
        revalidatePath("/staff");
        revalidatePath("/roster");
        return { success: true };
    } catch (error) {
        console.error("Error updating preference:", error);
        return { error: "Failed to update preference" };
    }
}

export async function updateProfile(id, data) {
    try {
        const updateData = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            preferredRestDay: data.preferredRestDay,
            preferredShift: data.preferredShift !== undefined ? data.preferredShift : undefined,
            avatar: data.avatar
        };

        // Update employment type if provided
        if (data.employmentType) {
            updateData.employmentType = data.employmentType;
        }
        if (data.maxWeeklyHours !== undefined && data.maxWeeklyHours !== null) {
            updateData.maxWeeklyHours = parseInt(data.maxWeeklyHours) || 40;
        }

        if (data.password && data.password.trim() !== "") {
            updateData.password = await bcrypt.hash(data.password, 10);
        }

        await prisma.user.update({
            where: { id },
            data: updateData,
        });
        revalidatePath("/");
        revalidatePath("/dashboard");
        revalidatePath("/staff");
        revalidatePath("/roster");
        return { success: true };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { error: "Failed to update profile" };
    }
}
