import { Assets, Spritesheet } from "pixi.js";

export type Dimensions = {
    w: number;
    h: number;
};

type AtlasConfig = {
    file: string;
    spriteAmount: Dimensions;
    assetDimensions: Dimensions;
    textures: readonly string[];
    animations?: Record<string, readonly string[]>;
};

// 📦 CONFIG SPRITESHEETS CENTRALISÉE
const atlasConfig = [
    {
        file: "/assets/character_sheet.png",
        spriteAmount: { w: 9, h: 11 },
        assetDimensions: { w: 32, h: 32 },
        textures: [
            "idle1", "idle2", "idle_right_1", "idle_right_2", "idle_left_1", "idle_left_2", "idle_back_1", "idle_back_2",
            "walk_down_1", "walk_down_2", "walk_down_3", "walk_down_4",
            "walk_right_1", "walk_right_2", "walk_right_3", "walk_right_4",
            "walk_left_1", "walk_left_2", "walk_left_3", "walk_left_4",
            "walk_up_1", "walk_up_2", "walk_up_3", "walk_up_4",
            "after_tp_idle_1", "after_tp_idle_2",
            "dash_attack_bottom_1", "dash_attack_bottom_2", "dash_attack_bottom_3", "dash_attack_bottom_4",
            "dash_attack_bottom_5", "dash_attack_bottom_6", "dash_attack_bottom_7", "dash_attack_bottom_8",
            "dash_attack_bottom_9", 
            "dash_attack_bottom_right_1", "dash_attack_bottom_right_2", "dash_attack_bottom_right_3",
            "dash_attack_bottom_right_4", "dash_attack_bottom_right_5", "dash_attack_bottom_right_6",
            "dash_attack_bottom_right_7", "dash_attack_bottom_right_8", "dash_attack_bottom_right_9",
            "dash_attack_right_1", "dash_attack_right_2", "dash_attack_right_3", "dash_attack_right_4",
            "dash_attack_right_5", "dash_attack_right_6", "dash_attack_right_7", "dash_attack_right_8",
            "dash_attack_right_9",
            "dash_attack_top_1", "dash_attack_top_2", "dash_attack_top_3", "dash_attack_top_4",
            "dash_attack_top_5", "dash_attack_top_6", "dash_attack_top_7", "dash_attack_top_8",

            "dash_attack_top_right_1", "dash_attack_top_right_2", "dash_attack_top_right_3", "dash_attack_top_right_4",
            "dash_attack_top_right_5", "dash_attack_top_right_6", "dash_attack_top_right_7", "dash_attack_top_right_8",
            "dash_attack_top_right_9",
            "knockback_from_right_1", "knockback_from_right_2", "knockback_from_right_3", "knockback_from_right_4",
            "player_death_1", "player_death_2", "player_death_3", "player_death_4", "player_death_5", "player_death_6", "player_death_7", "player_death_8", "player_death_9",
            "player_took_hit_from_right_side_1", "player_took_hit_from_right_side_2", "player_took_hit_from_right_side_3", "player_took_hit_from_right_side_4", "player_took_hit_from_right_side_5",
            "player_block_right_1",
            "player_1_attack_1", "player_1_attack_2", "player_1_attack_3", "player_1_attack_4"
        ] as const,
        animations: {
            player_idle: ["idle1", "idle2"],
            player_idle_right: ["idle_right_1", "idle_right_2"],
            player_idle_left: ["idle_left_1", "idle_left_2"],
            player_idle_back: ["idle_back_1", "idle_back_2"],
            player_walk_down: ["walk_down_1", "walk_down_2", "walk_down_3", "walk_down_4"],
            player_walk_right: ["walk_right_1", "walk_right_2", "walk_right_3", "walk_right_4"],
            player_walk_left: ["walk_left_1", "walk_left_2", "walk_left_3", "walk_left_4"],
            player_walk_up: ["walk_up_1", "walk_up_2", "walk_up_3", "walk_up_4"],
            after_tp_idle: ["after_tp_idle_1", "after_tp_idle_2"],
            player_die: ["player_death_1", "player_death_2", "player_death_3", "player_death_4", "player_death_5", "player_death_6", "player_death_7", "player_death_8", "player_death_9"],
            player_block_right: ["player_block_right_1"],
            player_took_hit_from_right_side: ["player_took_hit_from_right_side_1", "player_took_hit_from_right_side_2", "player_took_hit_from_right_side_3", "player_took_hit_from_right_side_4", "player_took_hit_from_right_side_5"],
            knockback_from_right: ["knockback_from_right_1", "knockback_from_right_2", "knockback_from_right_3", "knockback_from_right_4"],
            player_dash_attack_right: [
                "dash_attack_right_1", "dash_attack_right_2", "dash_attack_right_3", "dash_attack_right_4",
                "dash_attack_right_5", "dash_attack_right_6", "dash_attack_right_7", "dash_attack_right_8",
                "dash_attack_right_9"
            ],
            player_dash_attack_top: [
                "dash_attack_top_1", "dash_attack_top_2", "dash_attack_top_3", "dash_attack_top_4",
                "dash_attack_top_5", "dash_attack_top_6", "dash_attack_top_7", "dash_attack_top_8",
            ],
            player_dash_attack_bottom: [
                "dash_attack_bottom_1", "dash_attack_bottom_2", "dash_attack_bottom_3", "dash_attack_bottom_4",
                "dash_attack_bottom_5", "dash_attack_bottom_6", "dash_attack_bottom_7", "dash_attack_bottom_8",
                "dash_attack_bottom_9"
            ],
            player_dash_attack_top_right: [
                "dash_attack_top_right_1", "dash_attack_top_right_2", "dash_attack_top_right_3", "dash_attack_top_right_4",
                "dash_attack_top_right_5", "dash_attack_top_right_6", "dash_attack_top_right_7", "dash_attack_top_right_8",
                "dash_attack_top_right_9"
            ],
            player_dash_attack_bottom_right: [
                "dash_attack_bottom_right_1", "dash_attack_bottom_right_2", "dash_attack_bottom_right_3",
                "dash_attack_bottom_right_4", "dash_attack_bottom_right_5", "dash_attack_bottom_right_6",
                "dash_attack_bottom_right_7", "dash_attack_bottom_right_8", "dash_attack_bottom_right_9"
            ],
            player_1_attack: ["player_1_attack_1", "player_1_attack_2", "player_1_attack_3", "player_1_attack_4"]


        } as const
    },
    {
        file: "/assets/spritesheet.png",
        spriteAmount: { w: 8, h: 8 },
        assetDimensions: { w: 16, h: 16 },
        textures: [
            "grass_1", "grass_2", "grass_3", "grass_4",
            "forest_right_edge", "forest_edge_1", "forest_edge_2", "forest_edge_3",
            "forest_left_edge", "forest_center_1", "forest_center_2", "forest_one_edge", "forest_0_edge",
            "path_i", "path_u", "path_l_1", "path_l_2", "path_t", "path_x",
            "furnace", "furnace_on_1", "furnace_on_2", "furnace_on_3",
            "workbench", "crate", "core", "stone", "coal", "copper", "iron",
            "flower_1", "flower_2", "flower_3", "bush_1", "bush_2", "bush_3",
            "stone_ore", "coal_ore", "copper_ore", "copper_ingot", "iron_ore", "iron_ingot",
            "wood_log", "wood_plank", "seed", "pickaxe", "shovel", "axe",
            "iron_rod", "nail", "iron_frame", "iron_plate", "reinforced_iron_plate",
            "codebot_item", "cement", "concrete", "codebot_1", "codebot_2", "codebot_3", "codebot_4",
            "power", "close"
        ] as const
    },
    {
        file: "/assets/trees.png",
        spriteAmount: { w: 2, h: 2 },
        assetDimensions: { w: 16, h: 32 },
        textures: ["tree_1", "tree_2", "tree_3", "tree_4"] as const
    },
   
  
   
    {
        file: "/assets/tp_effect.png",
        spriteAmount: { w: 2, h: 3 },
        assetDimensions: { w: 128, h: 128 },
        textures: ["tp_effect_1", "tp_effect_2", "tp_effect_3", "tp_effect_4", "tp_effect_5", "tp_effect_6"] as const,
        animations: {
            tp_effect: ["tp_effect_1", "tp_effect_2", "tp_effect_3", "tp_effect_4", "tp_effect_5", "tp_effect_6"]
        } as const
    },
    {
        file: "/assets/took_hit_from_right_effect.png",
        spriteAmount: { w: 5, h: 1 },
        assetDimensions: { w: 64, h: 64 },
        textures: ["took_hit_from_right_effect_1", "took_hit_from_right_effect_2", "took_hit_from_right_effect_3", "took_hit_from_right_effect_4", "took_hit_from_right_effect_5"] as const,
        animations: {
            took_hit_from_right_effect: ["took_hit_from_right_effect_1", "took_hit_from_right_effect_2", "took_hit_from_right_effect_3", "took_hit_from_right_effect_4", "took_hit_from_right_effect_5"]
        } as const
    },
   
  
    {
        file: "/assets/attack_effect_right_1.png",
        spriteAmount: { w: 2, h: 2 },
        assetDimensions: { w: 128, h: 128 },
        textures: ["attack_effect_right_1", "attack_effect_right_2", "attack_effect_right_3", "attack_effect_right_4"] as const,
        animations: {
            player_attack_effect_right_1: ["attack_effect_right_1", "attack_effect_right_2", "attack_effect_right_3", "attack_effect_right_4"]
        } as const
    },
    {
        file: "/assets/attack_effect_right_2.png",
        spriteAmount: { w: 3, h: 3 },
        assetDimensions: { w: 128, h: 128 },
        textures: [
            "attack_effect_right_1", "attack_effect_right_2", "attack_effect_right_3",
            "attack_effect_right_4", "attack_effect_right_5", "attack_effect_right_6", "attack_effect_right_7"
        ] as const,
        animations: {
            player_attack_effect_right_2: [
                "attack_effect_right_1", "attack_effect_right_2", "attack_effect_right_3",
                "attack_effect_right_4", "attack_effect_right_5", "attack_effect_right_6", "attack_effect_right_7"
            ]
        } as const
    },
    {
        file: "/assets/dash_attack_effect.png",
        spriteAmount: { w: 6, h: 1 },
        assetDimensions: { w: 128, h: 128 },
        textures: [
            "dash_attack_effect_1", "dash_attack_effect_2", "dash_attack_effect_3",
            "dash_attack_effect_4", "dash_attack_effect_5", "dash_attack_effect_6"
        ] as const,
        animations: {
            player_dash_attack_effect: [
                "dash_attack_effect_1", "dash_attack_effect_2", "dash_attack_effect_3",
                "dash_attack_effect_4", "dash_attack_effect_5", "dash_attack_effect_6"
            ]
        } as const
    },
   
   
   
   
    {
        file: "/assets/gui_spritesheet.png",
        spriteAmount: { w: 3, h: 3 },
        assetDimensions: { w: 30, h: 30 },
        textures: ["light_square", "dark_square", "light_frame", "dark_frame", "scroll", "bar", "selected_slot"] as const
    },

] as const;

// 🔥 Types dynamiques
type Atlas = typeof atlasConfig[number];
export type TextureName = Atlas["textures"][number];
type ExtractAnimations<T> = T extends { animations: Record<string, readonly string[]> }
    ? keyof T["animations"] : never;
export type AnimationName = ExtractAnimations<Atlas>;

// Générateur
const generateAtlas = (config: AtlasConfig) => {
    const { file, spriteAmount, assetDimensions, textures, animations } = config;
    return {
        meta: {
            image: file,
            format: "RGBA8888",
            size: { w: spriteAmount.w * assetDimensions.w, h: spriteAmount.h * assetDimensions.h },
            scale: 1,
        },
        frames: textures.reduce((acc, name, i) => {
            acc[name] = {
                frame: {
                    ...assetDimensions,
                    x: (i % spriteAmount.w) * assetDimensions.w,
                    y: Math.floor(i / spriteAmount.w) * assetDimensions.h,
                },
                sourceSize: assetDimensions,
                spriteSourceSize: { ...assetDimensions, x: 0, y: 0 },
            };
            return acc;
        }, {} as Record<string, any>),
        animations,
    };
};

// Chargement
export const getSpritesheets = async () => {
    const atlases = atlasConfig.map(generateAtlas);
    const assets = await Promise.all(
        atlases.map((atlas) => Assets.load({ src: atlas.meta.image, data: { scaleMode: "nearest" } }))
    );
    const sheets = assets.map((a, i) => new Spritesheet(a, atlases[i] as any));
    await Promise.all(sheets.map((s) => s.parse()));
    return sheets;
};

// Helpers
export const findTexture = (sheets: Spritesheet[], name: TextureName) =>
    sheets.find((s) => s.textures[name])?.textures[name];
export const findAnimation = (sheets: Spritesheet[], name: AnimationName) =>
    sheets.find((s) => s.animations[name])?.animations[name];
