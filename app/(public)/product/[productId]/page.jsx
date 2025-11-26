"use client";
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function Product() {
  const { productId } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState();
  const products = useSelector((state) => state.product.list);

  const fetchProduct = async () => {
    const product = products.find((product) => product.id === productId);
    setProduct(product);
  };

  useEffect(() => {
    if (products.length > 0) {
      fetchProduct();
    }
    scrollTo(0, 0);
  }, [productId, products]);

  return (
    <div className="mx-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrums */}
        <div className="text-gray-600 text-sm mt-8 mb-5">
          <span
            onClick={() => router.push("/")}
            className="cursor-pointer hover:text-slate-800"
          >
            Home
          </span>
          {" / "}
          <span
            onClick={() => router.push("/shop")}
            className="cursor-pointer hover:text-slate-800"
          >
            Products
          </span>
          {" / "}
          <span
            onClick={() => router.push(`/shop?category=${product?.category}`)}
            className="cursor-pointer hover:text-slate-800"
          >
            {product?.category}
          </span>
        </div>

        {/* Product Details */}
        {product && <ProductDetails product={product} />}

        {/* Description & Reviews */}
        {product && <ProductDescription product={product} />}
      </div>
    </div>
  );
}
