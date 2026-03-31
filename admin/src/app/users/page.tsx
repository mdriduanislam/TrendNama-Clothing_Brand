import { User, columns } from "./columns";
import { DataTable } from "./data-table";
import { readAdminUsers } from "@/lib/users-data";

const getData = async (): Promise<User[]> => {
  return readAdminUsers();
};

const UsersPage = async () => {
  const data = await getData();
  return (
    <div className="">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semibold">All Users</h1>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default UsersPage;
