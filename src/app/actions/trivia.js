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
        // 0. Check if already answered correctly to prevent score spam/double counting
        const existingHistory = await prisma.triviaHistory.findUnique({
            where: {
                userId_questionId_weekNumber: {
                    userId,
                    questionId,
                    weekNumber
                }
            }
        });

        if (existingHistory && existingHistory.correct) {
            // User already got this right, do not award points again
            return { success: true, totalPoints: (await prisma.triviaScore.findUnique({ where: { userId } }))?.points || 0 };
        }

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

        // 2. Update Total Score if correct AND it's the first time they get it right
        if (isCorrect) {
            // If they had a previous WRONG attempt, it's fine, we update to correct.
            // Points: 10 for 1st try, 5 for 2nd try.
            // NOTE: The client sends 'tries'. We trust it for now, but strictly we could check existingHistory to verify 'tries'.
            // If existingHistory exists (and was false), this is effectively try #2 or more.

            let points = 10;
            if (tries > 1 || existingHistory) {
                points = 5;
            }

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
