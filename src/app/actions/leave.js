"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function requestLeave(userId, formData) {
    const startDate = new Date(formData.get("startDate"));
    const endDate = new Date(formData.get("endDate"));
    const reason = formData.get("reason");

    if (endDate < startDate) {
        return { error: "End date cannot be before start date" };
    }

    try {
        await prisma.leaveRequest.create({
            data: {
                userId,
                startDate,
                endDate,
                reason,
                status: "PENDING"
            }
        });
        revalidatePath("/my-leave");
        return { success: true };
    } catch (error) {
        console.error("Error requesting leave:", error);
        return { error: "Failed to submit leave request" };
    }
}

export async function cancelLeave(id, userId) {
    try {
        // Ensure the user owns the request
        const request = await prisma.leaveRequest.findUnique({
            where: { id }
        });

        if (!request || request.userId !== userId) {
            return { error: "Unauthorized" };
        }

        await prisma.leaveRequest.delete({
            where: { id }
        });
        revalidatePath("/my-leave");
        return { success: true };
    } catch (error) {
        console.error("Error cancelling leave:", error);
        return { error: "Failed to cancel leave request" };
    }
}
