import { useState } from "react";
import { NavLink } from "react-router-dom";

export const Category = ({
  category,
  selectedCategory = null,
  selectedsubCategory = null,
}) => {
  const [open, setOpen] = useState(false);
  const [firstTap, setFirstTap] = useState(false);

  return (
    <div
      className="flex w-full p-1"
      onMouseLeave={() => {
        setOpen(false);
      }}>
      <NavLink
        to={`/category/${encodeURIComponent(category.slug)}`}
        onMouseEnter={() => setOpen(true)}
        onClick={(e) => {
          const isMobile = window.innerWidth < 768;

          if (!isMobile) return;

          if (!firstTap) {
            e.preventDefault();
            setOpen(true);
            setFirstTap(true);

            setTimeout(() => setFirstTap(false), 200);
          } else {
            setOpen(false);
            setFirstTap(false);
          }
        }}
        className={`justify-between w-full font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center
        ${
          selectedCategory === category.categoryName
            ? "text-white bg-[#19528F]"
            : "text-black bg-white hover:bg-gray-200"
        }`}>
        {category.categoryName}
        <svg
          className="w-2.5 h-2.5 rtl:rotate-180"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 6 10">
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="m1 9 4-4-4-4"
          />
        </svg>
      </NavLink>

      {open && category.subCategories && category.subCategories.length > 0 && (
        <div className="relative">
          <div className="absolute left-0 top-0 shadow-md z-10 bg-white border border-gray-300 divide-gray-100 rounded-lg flex">
            <div className="ml-1">
              {category.subCategories.map((item, idx) => (
                <NavLink
                  key={idx}
                  to={`/category/${encodeURIComponent(
                    category.slug
                  )}/${encodeURIComponent(item.slug)}`}
                  className={`text-base font-medium whitespace-nowrap rounded-lg px-4 py-2 flex justify-between items-center ${
                    selectedsubCategory === item.subCategoryName
                      ? "bg-[#15579C] text-white"
                      : "bg-white hover:bg-gray-100 text-gray-700"
                  }`}>
                  <span>{item.subCategoryName}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;
