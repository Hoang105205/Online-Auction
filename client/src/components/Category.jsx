import { useState } from 'react';

export const Category = ({ category }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="flex w-full p-1" onMouseLeave={() => setOpen(false)}>
            <button 
                onClick={() => setOpen(true)}
                className="justify-between w-full text-black hover:bg-gray-200 focus:bg-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center" 
                type="button"
            >
                {category}
                <svg className="w-2.5 h-2.5 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m1 9 4-4-4-4" />
                </svg>
            </button>
            {open && (
                <div className="relative">
                    <div 
                        className="absolute shadow-md z-10 bg-white divide-gray-100 rounded-lg dark:bg-gray-700"
                    >
                        <ul className="text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefault">
                            <li>
                                <a href="#" className="block rounded-lg px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">HALAAAAAAAAAAAAAAAAO</a>
                            </li>
                            <li>
                                <a href="#" className="block rounded-lg px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Settings</a>
                            </li>
                            <li>
                                <a href="#" className="block rounded-lg px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Earnings</a>
                            </li>
                            <li>
                                <a href="#" className="block rounded-lg px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Sign out</a>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Category;