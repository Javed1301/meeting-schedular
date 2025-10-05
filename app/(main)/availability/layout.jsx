import { Suspense } from "react";

export default function AvailabilityLayout({children}) {
    return(
        <div className="mx-auto">
            <Suspense fallback={<p>Loading Availability...</p>}>
                {children}
            </Suspense>
        </div>
    )
}