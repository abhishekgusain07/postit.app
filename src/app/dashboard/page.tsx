"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const DashboardPage = () => {
    const router = useRouter();
    
    useEffect(() => {
        // Redirect to Connect page by default
        router.replace("/dashboard/connect");
    }, [router]);

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-lg text-muted-foreground">
                Redirecting to Connect...
            </div>
        </div>
    );
};

export default DashboardPage;