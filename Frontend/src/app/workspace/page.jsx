"use client";

import Sidebar from "@/components/sidebar";
import {
    Card,
    Input,
    Checkbox,
    Button,
    Typography,
} from "@material-tailwind/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Workspace() {

    const [name, setName] = useState("");
    const [link, setLink] = useState("");
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleCreateJob = async (e) => {
        e.preventDefault();
        setError(null);

        const token = localStorage.getItem("authToken");

        try {
            const response = await fetch("http://127.0.0.1:5000/scrape", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-access-token": token,
                }, 
                body: JSON.stringify({
                    "name": name,
                    "website_url": link,
                    "workspace_id": 1,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                const id = data.file_id;
                console.log("Job created successfully.");
                router.push(`/workspace/${id}`);
            }
        }
        catch (error) {
            setError("An error occurred during job creation.");
            console.error("Error during job creation:", error);
        }
    }

    return (
        <div className="flex h-full w-full">
            <Sidebar />
            <div className={'grow w-full overflow-x-hidden transition-all duration-300 flex flex-col ml-14 mt-10'}>
                <div className="my-3">
                    <Typography variant="h2" color="indigo">Workspaces</Typography>
                </div>
                <Card color="white" shadow={false} className="p-10 flex justify-center item-center w-11/12 md:11/12">
                    <div className="flex gap-4 flex-col">
                        <Typography variant="h4" color="blue-gray">
                            New Scrape
                        </Typography>
                        <div className="flex items-center justify-between">
                            <div className="mb-1 flex gap-4">
                                <Typography variant="h6" color="blue-gray" className="-mb-3 mt-2">
                                    Name
                                </Typography>
                                <Input
                                    size="lg"
                                    placeholder="job name"
                                    className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                                    labelProps={{
                                        className: "before:content-none after:content-none",
                                    }}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <Typography variant="h6" color="blue-gray" className="-mb-3 mt-2">
                                    Link
                                </Typography>
                                <Input
                                    size="lg"
                                    placeholder="https://example.com"
                                    className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                                    labelProps={{
                                        className: "before:content-none after:content-none",
                                    }}
                                    onChange={(e) => setLink(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleCreateJob}>
                                Create Job
                            </Button>
                        </div>
                    </div>
                    {error && (
                        <Typography variant="p" color="red">
                            {error}
                        </Typography>
                    )}
                </Card>
            </div>
        </div>
    );
}