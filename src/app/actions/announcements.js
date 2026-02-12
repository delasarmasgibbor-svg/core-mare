"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createAnnouncement(formData) {
    const title = formData.get("title");
    const body = formData.get("body");
    const authorId = formData.get("authorId");

    if (!title || !body || !authorId) {
        throw new Error("Missing required fields");
    }

    try {
        const announcement = await prisma.announcement.create({
            data: {
                title,
                body,
                authorId,
            },
        });
        revalidatePath("/dashboard");
        return { success: true, announcement };
    } catch (error) {
        console.error("Error creating announcement:", error);
        return { error: "Failed to create announcement" };
    }
}

export async function getRecentAnnouncements(limit = 5) {
    try {
        return await prisma.announcement.findMany({
            take: limit,
            orderBy: { createdAt: "desc" },
            include: { author: { select: { name: true } } },
        });
    } catch (error) {
        console.error("Error fetching announcements:", error);
        return [];
    }
}
