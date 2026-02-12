"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function createIdea(content) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }

    try {
        const idea = await prisma.idea.create({
            data: {
                content,
                authorId: session.user.id
            }
        });
        revalidatePath("/dashboard");
        revalidatePath("/my-schedule");
        return { success: true, idea };
    } catch (error) {
        console.error("Error creating idea:", error);
        return { error: `Failed to share idea: ${error.message}` };
    }
}

export async function getIdeas() {
    try {
        const ideas = await prisma.idea.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: {
                author: {
                    select: {
                        name: true,
                        avatar: true,
                        triviaScore: {
                            select: {
                                correctCount: true
                            }
                        }
                    }
                }
            }
        });
        return { success: true, ideas };
    } catch (error) {
        console.error("Error fetching ideas:", error);
        return { error: "Failed to fetch ideas" };
    }
}
