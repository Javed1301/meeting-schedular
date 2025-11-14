"use client";

import { Suspense } from "react";

export default function NotFound() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Page404 />
    </Suspense>
  );
}

function Page404() {
  // Remove this if not needed:
  // const params = useSearchParams();

  return (
    <div className="text-4xl font-extrabold w-screen pt-75 grid place-items-center">
      <h1>404 - Page Not Found</h1>
    </div>
  );
}


/*
return (
    <div className="text-4xl font-extrabold w-screen pt-75 grid place-items-center">
      <h1>404 - Page Not Found</h1>
    </div>
  );
*/