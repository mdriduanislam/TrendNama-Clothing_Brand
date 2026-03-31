import { ProductsType } from "@/types";
import Categories from "./Categories";
import ProductCard from "./ProductCard";
import Link from "next/link";
import Filter from "./Filter";
import { readProducts } from "@/lib/products-data";
const ProductList = async ({
  category,
  sort,
  search,
  params,
}: {
  category?: string;
  sort?: string;
  search?: string;
  params: "homepage" | "products";
}) => {
  const products = await readProducts();

  let filteredProducts: ProductsType = products;

  if (search) {
    const searchLower = search.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
    );
  }

  if (category && category !== "all") {
    filteredProducts = filteredProducts.filter(
      (product) => product.category === category
    );
  }

  if (sort === "asc") {
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  } else if (sort === "desc") {
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
  } else if (sort === "oldest") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  } else {
    filteredProducts = [...filteredProducts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  if (params === "homepage") {
    filteredProducts = filteredProducts.slice(0, 8);
  }

  return (
    <div className="w-full">
      <Categories />
      {params === "products" && <Filter />}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-12">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {params === "homepage" && (
        <Link
          href={category ? `/products/?category=${category}` : "/products"}
          className="flex justify-end mt-4 underline text-sm text-gray-500"
        >
          View all products
        </Link>
      )}
    </div>
  );
};

export default ProductList;
