"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function recordTriviaScore(questionId, weekNumber, tries, isCorrect) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("Unauthorized");

    const userId = session.user.id;

    try {
        // 1. Record History
        await prisma.triviaHistory.upsert({
            where: {
                userId_questionId_weekNumber: {
                    userId,
                    questionId,
                    weekNumber
                }
            },
            update: {
                correct: isCorrect
            },
            create: {
                userId,
                questionId,
                weekNumber,
                correct: isCorrect
            }
        });

        // 2. Update Total Score if correct
        if (isCorrect) {
            const points = tries === 1 ? 10 : 5;
            await prisma.triviaScore.upsert({
                where: { userId },
                update: {
                    points: { increment: points },
                    correctCount: { increment: 1 }
                },
                create: {
                    userId,
                    points,
                    correctCount: 1
                }
            });
        }

        revalidatePath("/dashboard");
        revalidatePath("/my-schedule");

        // Return the new points to help with immediate UI updates
        const updatedScore = await prisma.triviaScore.findUnique({ where: { userId } });
        return { success: true, totalPoints: updatedScore?.points || 0 };
    } catch (error) {
        console.error("Error recording trivia score:", error);
        return { success: false, error: "Failed to save score" };
    }
}

export async function getTriviaLeaderboard() {
    try {
        const topScores = await prisma.triviaScore.findMany({
            take: 10,
            orderBy: { points: 'desc' },
            include: {
                user: {
                    select: {
                        name: true,
                        avatar: true
                    }
                }
            }
        });
        return { success: true, topScores };
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return { error: "Failed to fetch leaderboard" };
    }
}

export async function getUserTriviaStatus(weekNumber) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { success: false };

    try {
        const history = await prisma.triviaHistory.findMany({
            where: {
                userId: session.user.id,
                weekNumber
            }
        });

        const score = await prisma.triviaScore.findUnique({
            where: { userId: session.user.id }
        });

        return {
            success: true,
            history,
            totalPoints: score?.points || 0,
            correctCount: score?.correctCount || 0
        };
    } catch (error) {
        console.error("Error fetching user trivia status:", error);
        return { error: "Failed to fetch status" };
    }
}
