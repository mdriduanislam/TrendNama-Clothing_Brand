import Link from "next/link";
import { notFound } from "next/navigation";

import EditProductForm from "@/components/EditProductForm";
import { readProductById } from "@/lib/products-data";

const ProductEditPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const product = await readProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Edit Product</h1>
        <Link href="/products" className="text-sm underline">
          Back to products
        </Link>
      </div>
      <EditProductForm product={product} />
    </div>
  );
};

export default ProductEditPage;
