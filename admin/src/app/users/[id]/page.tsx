import { notFound } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { readAdminUserById } from "@/lib/users-data";

const SingleUserPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const user = await readAdminUserById(id);

  if (!user) {
    notFound();
  }

  const initials = user.fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-primary-foreground p-6 rounded-lg border space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-12">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold">{user.fullName}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <p>
            <span className="font-semibold">User ID:</span> {user.id}
          </p>
          <p>
            <span className="font-semibold">Status:</span> {user.status}
          </p>
          <p>
            <span className="font-semibold">Joined:</span>{" "}
            {new Date(user.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SingleUserPage;
