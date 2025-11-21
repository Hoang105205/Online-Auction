import { useState } from "react";
import Category from "./Category";
import HomeContent from "./HomeContent";
import SideBar from "./SideBar";

const LandingProduct = () => {
  return (
    <div className="flex">
      <aside className="flex z-50 md:border-r md:p-4">
        <SideBar />
      </aside>
      <main className="flex-1">
        <HomeContent />
      </main>
    </div>
  );
};

export default LandingProduct;
