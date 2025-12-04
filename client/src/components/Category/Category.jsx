import { useState } from "react";
import { NavLink } from "react-router-dom";

export const Category = ({ category }) => {
  const [open, setOpen] = useState(false);
  const [openSubIndex, setOpenSubIndex] = useState(null);
  const [firstTap, setFirstTap] = useState(false);

  return (
    <div
      className="flex w-full p-1"
      onMouseLeave={() => {
        setOpen(false);
        setOpenSubIndex(null);
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

            setTimeout(() => setFirstTap(false), 2000);
          } else {
            setOpen(false);
            setFirstTap(false);
          }
        }}
        className="justify-between w-full text-black hover:bg-gray-200 focus:bg-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center">
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

      {open && (
        <div className="relative">
          <div className="absolute left-0 top-0 shadow-md z-10 bg-white divide-gray-100 rounded-lg dark:bg-gray-700 flex">
            {/* First column: top-level items */}
            <div className="ml-1">
              {category.subCategories.map((item, idx) => (
                <div
                  key={item.subCategoryId}
                  onMouseEnter={() => setOpenSubIndex(idx)}
                  onMouseLeave={() =>
                    setOpenSubIndex((i) => (i === idx ? null : i))
                  }>
                  {/* Always make the left item a navigable link (even if it has subItems) */}
                  <NavLink
                    to={`/category/${encodeURIComponent(
                      category.slug
                    )}/${encodeURIComponent(item.slug)}`}
                    className={
                      "text-base font-normal whitespace-nowrap rounded-lg px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white flex justify-between items-center"
                    }>
                    <span>{item.subCategoryName}</span>
                  </NavLink>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;
