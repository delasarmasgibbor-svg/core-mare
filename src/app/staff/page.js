import prisma from "@/lib/prisma";
import StaffList from "@/components/StaffList";

export default async function StaffPage() {
  const staff = await prisma.user.findMany({
    where: {
      role: "STAFF",
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div style={{ padding: '2rem' }}>
      <StaffList initialStaff={JSON.parse(JSON.stringify(staff))} />
    </div>
  );
}
