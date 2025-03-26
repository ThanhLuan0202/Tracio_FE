import React from "react";
import { Link, useLocation } from "react-router-dom";

const Breadcrumbs = () => {
  const location = useLocation();
  const paths = location.pathname.split("/").filter((path) => path);

  return (
    <nav className="text-gray-500 text-sm py-4 pl-12 md:pl-40">
      <Link to="/" className="hover:underline">
        Home
      </Link>
      {paths.map((path, index) => {
        const routeTo = `/${paths.slice(0, index + 1).join("/")}`;
        const isLast = index === paths.length - 1;

        return (
          <span key={routeTo} className="mx-1">
            /{" "}
            {isLast ? (
              <span className="font-bold text-black capitalize">{path}</span>
            ) : (
              <Link to={routeTo} className="hover:underline capitalize">
                {path}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
