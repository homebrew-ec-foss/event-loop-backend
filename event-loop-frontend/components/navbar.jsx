import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuLink,
} from "@radix-ui/react-navigation-menu";
import Link from "next/link";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { LucideGoal } from "lucide-react";

export default function Navbar() {
    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <Link href="/" legacyBehavior passHref>
                        <NavigationMenuLink
                            className={navigationMenuTriggerStyle()}
                        >
                            Home
                        </NavigationMenuLink>
                    </Link>
                    <Link href="/ping" legacyBehavior passHref>
                        <NavigationMenuLink
                            className={navigationMenuTriggerStyle()}
                        >
                            Ping
                        </NavigationMenuLink>
                    </Link>
                    {localStorage.getItem("google-oauth") &&
                        (() => {
                            const userData = JSON.parse(
                                localStorage.getItem("google-oauth"),
                            );
                            return userData.userRole === "admin";
                        })() && (
                            <Link href="/create" legacyBehavior passHref>
                                <NavigationMenuLink
                                    className={navigationMenuTriggerStyle()}
                                >
                                    Create
                                </NavigationMenuLink>
                            </Link>
                        )}
                    {localStorage.getItem("google-oauth") &&
                        (() => {
                            const userData = JSON.parse(
                                localStorage.getItem("google-oauth"),
                            );
                            return (
                                userData.userRole === "admin" ||
                                userData.userRole === "volunteer"
                            );
                        })() && (
                            <div className="inline">
                                <Link
                                    href="/checkpoint"
                                    legacyBehavior
                                    passHref
                                >
                                    <NavigationMenuLink
                                        className={navigationMenuTriggerStyle()}
                                    >
                                        Checkpoint
                                    </NavigationMenuLink>
                                </Link>

                                <Link href="/checkin" legacyBehavior passHref>
                                    <NavigationMenuLink
                                        className={navigationMenuTriggerStyle()}
                                    >
                                        Checkin
                                    </NavigationMenuLink>
                                </Link>
                                <Link href="/checkout" legacyBehavior passHref>
                                    <NavigationMenuLink
                                        className={navigationMenuTriggerStyle()}
                                    >
                                        Checkout
                                    </NavigationMenuLink>
                                </Link>
                            </div>
                        )}
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
}
