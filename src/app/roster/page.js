import prisma from "@/lib/prisma";
import RosterManager from "@/components/RosterManager";

import { startOfWeek, endOfWeek } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function RosterPage() {
    // 1. Fetch all chefs with their availabilities
    const chefs = await prisma.user.findMany({
        where: { role: "STAFF" },
        include: { availabilities: true },
        orderBy: { name: 'asc' }
    });

    // Assign colors to chefs consistently
    const chefsWithColors = chefs.map((chef, index) => ({
        ...chef,
        color: `var(--chef-${(index % 6) + 1})`
    }));

    // 2. Fetch shifts for the "current" week ONLY
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
    const end = endOfWeek(now, { weekStartsOn: 1 });

    const shifts = await prisma.shift.findMany({
        where: {
            date: {
                gte: start,
                lte: end
            }
        },
        include: { user: true }
    });

    const initialRoster = {};
    const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    shifts.forEach(shift => {
        const dayName = DAYS[new Date(shift.date).getDay()];
        const cellId = `${dayName}-${shift.type}`;

        if (!initialRoster[cellId]) {
            initialRoster[cellId] = [];
        }

        // Find the chef in our list to get their assigned color
        const chef = chefsWithColors.find(c => c.id === shift.userId);
        if (chef) {
            initialRoster[cellId].push(chef);
        }
    });

    return (
        <RosterManager
            initialChefs={JSON.parse(JSON.stringify(chefsWithColors))}
            initialRoster={JSON.parse(JSON.stringify(initialRoster))}
        />
    );
}
