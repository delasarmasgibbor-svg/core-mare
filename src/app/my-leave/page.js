import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import LeaveManager from "@/components/LeaveManager";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function MyLeavePage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="animate-fade" style={{ padding: '0 2rem' }}>
            <header style={{ marginBottom: '3rem' }}>
                <h1 style={{ marginBottom: '0.5rem', fontSize: '2.5rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>My Leave</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Manage your time off and view request status.</p>
            </header>

            <div style={{ maxWidth: '700px' }}>
                <LeaveManager user={session.user} initialRequests={leaveRequests} />
            </div>
        </div>
    );
}
