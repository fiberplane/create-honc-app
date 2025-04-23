import type { ComponentProps } from "astro/types";
import { Icon } from "@astrojs/starlight/components";

type SocialConfig = {
    iconName: ComponentProps<typeof Icon>["name"];
    title: string;
    url: string;
}

export const socials: {
    github: SocialConfig;
    discord: SocialConfig;
} = {
    github: {
        iconName: "github",
        title: "GitHub",
        url: "https://github.com/fiberplane/create-honc-app",
    },
    discord: {
        iconName: "discord",
        title: "Discord",
        url: "https://discord.com/invite/ugAwAK6Yzm"
    }
}