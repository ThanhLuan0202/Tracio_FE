import React, { useEffect, useState } from "react";

const BlogSection = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch("https://67cec251125cd5af757bdeb7.mockapi.io/Blog"); // API thật
        const data = await response.json();
        setBlogs(data);
      } catch (error) {
        console.error("Lỗi khi tải blog:", error);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="px-6 py-8 w-full bg-gray-100">
      {/* BLOGS */}
      <div className="flex justify-between items-center w-full mb-6">
        <h1 className="text-lg font-extrabold text-black">BLOGS</h1>
        <button className="text-gray-500 hover:text-black flex items-center">
          See All <span className="ml-1">➤</span>
        </button>
      </div>

      {/* Nội dung Blog */}
      <div className="flex gap-6 w-full">
        {/* Blog lớn bên trái */}
        {blogs.length > 0 ? (
          <div className="relative flex-1 rounded-lg overflow-hidden">
            <img src={blogs[0].image} alt={blogs[0].title} className="w-full h-72  object-cover rounded-lg" />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
              <p className="text-white font-semibold">{blogs[0].title}</p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-300 h-64 flex-1 rounded-lg"></div>
        )}

        {/* Hai blog nhỏ bên phải */}
        <div className="flex flex-col gap-4 w-[300px] mt-2">
          {blogs.slice(1, 3).map((blog) => (
            <div key={blog.id} className="relative h-32 rounded-lg overflow-hidden">
              <img src={blog.image} alt={blog.title} className="w-full h-full object-cover rounded-lg" />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                <p className="text-white text-sm font-semibold">{blog.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogSection;
