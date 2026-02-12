import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import ProfileSettings from "@/components/ProfileSettings";
import prisma from "@/lib/prisma";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    // Fetch fresh user data to ensure we have the latest info
    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    return (
        <div className="animate-fade" style={{ padding: '0 2rem' }}>
            <header style={{ marginBottom: '3rem' }}>
                <h1 style={{ marginBottom: '0.5rem', fontSize: '2.5rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>My Profile</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Manage your personal information and contact details.</p>
            </header>

            <div style={{ maxWidth: '600px' }}>
                <ProfileSettings user={user} />
            </div>
        </div>
    );
}
