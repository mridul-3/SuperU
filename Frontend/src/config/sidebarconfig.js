import {Routes} from "@/routes";


const dashboardTab = {
    label: "Workspace",
    key: "workspace",
    path: Routes.workspace(),
};

const checkInTab = {
    label: "Settings",
    key: "settings",
    path: Routes.settings(),
};

const checkOutTab = {
    label: "Dashboard",
    key: "dashboard",
    path: Routes.dashboard(),
};


export const pathTabMap = new Map([
    [Routes.dashboard(), dashboardTab],
    [Routes.settings(), checkInTab],
    [Routes.workspace(), checkOutTab]
]);

export const keyTabMap = new Map([
    ["dashboard", dashboardTab],
    ["settings", checkInTab],
    ["workspace", checkOutTab]
]);