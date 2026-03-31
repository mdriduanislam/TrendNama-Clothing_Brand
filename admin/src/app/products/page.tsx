import { Product, columns } from "./columns";
import { DataTable } from "./data-table";
import { readProducts } from "@/lib/products-data";

const getData = async (): Promise<Product[]> => {
  return readProducts();
};

const PaymentsPage = async () => {
  const data = await getData();
  return (
    <div className="">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semibold">All Products</h1>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default PaymentsPage;
