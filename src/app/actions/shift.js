"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function requestSwap(shiftId, requesterId) {
    try {
        const shift = await prisma.shift.findUnique({
            where: { id: shiftId }
        });

        if (!shift || shift.userId !== requesterId) {
            return { error: "Shift not found or unauthorized" };
        }

        const existingSwap = await prisma.shiftSwap.findFirst({
            where: {
                requesterShiftId: shiftId,
                status: "PENDING"
            }
        });

        if (existingSwap) {
            return { error: "Swap request already pending" };
        }

        await prisma.shiftSwap.create({
            data: {
                requesterId,
                requesterShiftId: shiftId,
                status: "PENDING"
            }
        });

        revalidatePath("/my-schedule");
        return { success: true };
    } catch (error) {
        console.error("Error requesting swap:", error);
        return { error: "Failed to request swap" };
    }
}
