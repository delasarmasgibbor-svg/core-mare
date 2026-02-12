"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateHotelOccupancy(formData) {
    const currentGuests = parseInt(formData.get("guests"));
    const capacity = parseInt(formData.get("capacity"));
    const date = new Date(); // Using current date for live occupancy

    try {
        await prisma.hotelOccupancy.upsert({
            where: { id: "live-occupancy" }, // We'll use a fixed ID for the "current" status
            create: { id: "live-occupancy", date, currentGuests, capacity },
            update: { currentGuests, capacity, date },
        });
        revalidatePath("/hotel");
        return { success: true };
    } catch (error) {
        console.error("Error updating occupancy:", error);
        return { error: "Failed to update occupancy" };
    }
}

export async function addReservation(formData) {
    const date = new Date(formData.get("date"));
    const guestCount = parseInt(formData.get("count"));
    const notes = formData.get("notes") || "";
    const type = formData.get("type") || "STANDARD";
    const eventName = formData.get("eventName") || "";
    const session = formData.get("session") || "DINNER";

    try {
        const reservation = await prisma.reservation.create({
            data: {
                date,
                guestCount,
                notes,
                type,
                eventName,
                session,
            },
        });
        revalidatePath("/hotel");
        return { success: true, reservation };
    } catch (error) {
        console.error("Error adding reservation:", error);
        return { error: error.message };
    }
}

export async function clearReservations() {
    try {
        await prisma.reservation.deleteMany({});
        revalidatePath("/hotel");
        return { success: true };
    } catch (error) {
        console.error("Error clearing reservations:", error);
        return { error: "Failed to clear reservations" };
    }
}

export async function deleteReservation(id) {
    try {
        await prisma.reservation.delete({
            where: { id },
        });
        revalidatePath("/hotel");
        return { success: true };
    } catch (error) {
        console.error("Error deleting reservation:", error);
        return { error: "Failed to delete reservation" };
    }
}
