import { useState } from 'react';
import { NavLink } from "react-router-dom";

export const Category = ({ category }) => {
  const [open, setOpen] = useState(false);
  const [openSubIndex, setOpenSubIndex] = useState(null);

  return (
    <div className="flex w-full p-1" onMouseLeave={() => { setOpen(false); setOpenSubIndex(null); }}>
      <NavLink
        to={`/category/${encodeURIComponent(category.title)}`}
        onMouseEnter={() => setOpen(true)}
        className="justify-between w-full text-black hover:bg-gray-200 focus:bg-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center"
      >
        {category.title}
        <svg className="w-2.5 h-2.5 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m1 9 4-4-4-4" />
        </svg>
      </NavLink>

      {open && (
        <div className="relative">
          <div className="absolute left-0 top-0 shadow-md z-10 bg-white divide-gray-100 rounded-lg dark:bg-gray-700 flex">
            {/* First column: top-level items */}
            <div className="py-2">
                {category.items.map((item, idx) => (
                  <div
                    key={item.to}
                    onMouseEnter={() => setOpenSubIndex(idx)}
                    onMouseLeave={() => setOpenSubIndex((i) => (i === idx ? null : i))}
                  >
                    {/* Always make the left item a navigable link (even if it has subItems) */}
                    <NavLink
                      to={`/category/${encodeURIComponent(category.title)}/${encodeURIComponent(item.to)}`}
                      className={"rounded-lg px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white flex justify-between items-center"}
                    >
                      <span>{item.label}</span>
                      {item.subItems && item.subItems.length > 0 && (
                        <svg className="w-3 h-3 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m1 9 4-4-4-4" />
                        </svg>
                      )}
                    </NavLink>
                  </div>
                ))}
            </div>

            {/* Second column: show subitems for hovered top-level item */}
            <div className="py-2">
              {openSubIndex !== null && category.items[openSubIndex] && category.items[openSubIndex].subItems && category.items[openSubIndex].subItems.length > 0 ? (
                <div>
                  {category.items[openSubIndex].subItems.map((sub) => (
                    <NavLink
                      key={sub.to}
                      to={`/category/${encodeURIComponent(category.title)}/${encodeURIComponent(category.items[openSubIndex].to)}/${encodeURIComponent(sub.to)}`}
                      className={"block rounded-lg px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"}
                    >
                      <span>{sub.label}</span>
                    </NavLink>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;