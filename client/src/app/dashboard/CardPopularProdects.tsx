import { useGetDashboardMetricsQuery } from "@/state/api";
import React from "react";
import Image from "next/image";
import Rating from "../(components)/Rating";

const CardPopularProducts = () => {
  const { data: dashboardMetrics, isLoading, error } = useGetDashboardMetricsQuery();
  
  // For debugging
  console.log("Dashboard Metrics:", dashboardMetrics);
  
  return (
    <div className="row-span-3 xl:row-span-6 bg-white shadow-md rounded-2xl pb-16">
      {isLoading ? (
        <div className="m-5">Loading products...</div>
      ) : error ? (
        <div className="m-5 text-red-500">Error loading products</div>
      ) : !dashboardMetrics?.popularProducts?.length ? (
        <div className="m-5">No products found</div>
      ) : (
        <>
          <h3 className="text-lg font-semibold px-7 pt-5 pb-2">Popular Products</h3>
          <hr />
          <div className="overflow-auto h-full">
            {dashboardMetrics.popularProducts.map((product) => (
              <div
                key={product.productId}
                className="flex items-center justify-between gap-3 px-5 py-7 border-b"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-md flex items-center justify-center">
                    {/* Placeholder image since API doesn't provide images */}
                    <div className="w-8 h-8 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center text-xs font-medium">
                      {product.name.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{product.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-blue-600">${product.price.toFixed(2)}</span>
                      {product.rating && (
                        <div className="flex">
                          <Rating rating={product.rating} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                    {/* Calculate percentage based on stock quantity */}
                    {Math.max(0, Math.min(100, Math.round((1 - product.stockQuantity / 100) * 100)))}% Sold
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CardPopularProducts;