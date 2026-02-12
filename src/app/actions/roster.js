"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveRoster(rosterData) {
    // rosterData is an object like { 'Monday-MORNING': [chef1, chef2], ... }

    try {
        // For simplicity in this version, we'll clear and re-create for the "active" week
        // In a real app, you'd specify a week/year

        // Transaction to ensure atomicity
        await prisma.$transaction(async (tx) => {
            // Optional: delete existing shifts for the week if we had a week selector
            // For now, let's just create new shifts

            // We need to map the roster object back to the Shift model
            const shiftPromises = [];

            for (const [cellId, chefs] of Object.entries(rosterData)) {
                const [day, type] = cellId.split('-');
                // We'll calculate the date based on the current week for now
                const today = new Date();
                const dayIndex = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(day);
                const date = new Date(today);
                date.setDate(today.getDate() - today.getDay() + dayIndex);
                date.setHours(0, 0, 0, 0);

                chefs.forEach(chef => {
                    shiftPromises.push(tx.shift.create({
                        data: {
                            date,
                            type,
                            userId: chef.id
                        }
                    }));
                });
            }
            await Promise.all(shiftPromises);
        });

        revalidatePath("/roster");
        return { success: true };
    } catch (error) {
        console.error("Error saving roster:", error);
        return { error: "Failed to save roster" };
    }
}

export async function clearRoster() {
    try {
        await prisma.shift.deleteMany({});
        revalidatePath("/roster");
        return { success: true };
    } catch (error) {
        console.error("Error clearing roster:", error);
        return { error: "Failed to clear roster" };
    }
}
