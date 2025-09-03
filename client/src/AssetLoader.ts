import { Assets, Spritesheet } from "pixi.js";
export type AnimationName =
    "codebot" |
    "player_idle" |
    "player_idle_right" |
    "player_idle_left" |
    "player_idle_back" |
    "player_walk_down" |
    "player_walk_right" |
    "player_walk_left" |
    "player_walk_up" |
    "player_attack_effect_right_1" |
    "player_attack_effect_right_2" |
    "player_attack_3" |
    "player_dash_attack_effect" |
    "player_dash_attack_right" |
    "player_dash_attack_bottom_right" |
    "player_dash_attack_top_right"

    ;

export const findAnimation = (spriteSheets: Spritesheet[], animation: AnimationName) => {
    return spriteSheets.find((spritesheet) => spritesheet.animations[animation])?.animations[animation];
};
type Dimensions = {
    w: number;
    h: number;
};

export type TextureName =
    "grass_1" |
    "grass_2" |
    "grass_3" |
    "grass_4" |
    "forest_right_edge" |
    "forest_edge_1" |
    "forest_edge_2" |
    "forest_edge_3" |
    "forest_left_edge" |
    "forest_center_1" |
    "forest_center_2" |
    "forest_one_edge" |
    "forest_0_edge" |
    "path_i" |
    "path_u" |
    "path_l_1" |
    "path_l_2" |
    "path_t" |
    "path_x" |
    "furnace" |
    "furnace_on_1" |
    "furnace_on_2" |
    "furnace_on_3" |
    "workbench" |
    "crate" |
    "core" |
    "stone" |
    "coal" |
    "copper" |
    "iron" |
    "flower_1" |
    "flower_2" |
    "flower_3" |
    "bush_1" |
    "bush_2" |
    "bush_3" |
    "stone_ore" |
    "coal_ore" |
    "copper_ore" |
    "copper_ingot" |
    "iron_ore" |
    "iron_ingot" |
    "wood_log" |
    "wood_plank" |
    "seed" |
    "pickaxe" |
    "shovel" |
    "axe" |
    "iron_rod" |
    "nail" |
    "iron_frame" |
    "iron_plate" |
    "reinforced_iron_plate" |
    "codebot_item" |
    "cement" |
    "concrete" |
    "codebot_1" |
    "codebot_2" |
    "codebot_3" |
    "codebot_4" |
    "tree_1" |
    "tree_2" |
    "tree_3" |
    "tree_4" |
    "power" |
    "close" |
    "light_square" |
    "dark_square" |
    "light_frame" |
    "dark_frame" |
    "scroll" |
    "bar" |
    "selected_slot" |
    "idle1" |
    "idle2" |
    "idle_right_1" |
    "idle_right_2" |
    "idle_left_1" |
    "idle_left_2" |
    "idle_back_1" |
    "idle_back_2" |
    "walk_down_1" |
    "walk_down_2" |
    "walk_down_3" |
    "walk_down_4" |
    "walk_right_1" |
    "walk_right_2" |
    "walk_right_3" |
    "walk_right_4" |
    "walk_left_1" |
    "walk_left_2" |
    "walk_left_3" |
    "walk_left_4" |
    "walk_up_1" |
    "walk_up_2" |
    "walk_up_3" |
    "walk_up_4" |
    "attack_effect_right_1" |
    "attack_effect_right_2" |
    "attack_effect_right_3" |
    "attack_effect_right_4" |
    "attack_effect_right_5" |
    "attack_effect_right_6" |
    "attack_effect_right_7" |
    "dash_attack_effect_1" |
    "dash_attack_effect_2" |
    "dash_attack_effect_3" |
    "dash_attack_effect_4" |
    "dash_attack_effect_5" |
    "dash_attack_effect_6" |
    "dash_attack_right_1" |
    "dash_attack_right_2" |
    "dash_attack_right_3" |
    "dash_attack_right_4" |
    "dash_attack_right_5" |
    "dash_attack_right_6" |
    "dash_attack_right_7" |
    "dash_attack_right_8" |
    "dash_attack_right_9" |
    "dash_attack_right_10" |
    "dash_attack_top_right_1" |
    "dash_attack_top_right_2" |
    "dash_attack_top_right_3" |
    "dash_attack_top_right_4" |
    "dash_attack_top_right_5" |
    "dash_attack_top_right_6" |
    "dash_attack_top_right_7" |
    "dash_attack_top_right_8" |
    "dash_attack_top_right_9" |
    "dash_attack_top_right_10" |
    "dash_attack_bottom_right_1" |
    "dash_attack_bottom_right_2" |
    "dash_attack_bottom_right_3" |
    "dash_attack_bottom_right_4" |
    "dash_attack_bottom_right_5" |
    "dash_attack_bottom_right_6" |
    "dash_attack_bottom_right_7" |
    "dash_attack_bottom_right_8" |
    "dash_attack_bottom_right_9" |
    "dash_attack_bottom_right_10";

export const findTexture = (spriteSheets: Spritesheet[], texture: TextureName) => {
    return spriteSheets.find((spritesheet) => spritesheet.textures[texture])?.textures[texture];
};

const generateAtlas = (file: string, spriteAmount: Dimensions, assetDimensions: Dimensions, names: TextureName[], animations?: Partial<Record<AnimationName, TextureName[]>>) => {
    return {
        meta: {
            image: file,
            format: "RGBA8888",
            size: {
                w: spriteAmount.w * assetDimensions.w,
                h: spriteAmount.h * assetDimensions.h,
            },
            scale: 1,
        },
        frames: names.reduce((acc, name, i) => {
            acc[name] = {
                frame: {
                    ...assetDimensions,
                    x: (i % spriteAmount.w) * assetDimensions.w,
                    y: Math.floor(i / spriteAmount.w) * assetDimensions.h,
                },
                sourceSize: assetDimensions,
                spriteSourceSize: {
                    ...assetDimensions,
                    x: 0,
                    y: 0,
                },
            };

            return acc;
        }, {}),
        animations,
    };
};

const atlas = [
    generateAtlas("/assets/spritesheet.png", { w: 8, h: 8 }, { w: 16, h: 16 }, [
        "grass_1",
        "grass_2",
        "grass_3",
        "grass_4",
        "forest_right_edge",
        "forest_edge_1",
        "forest_edge_2",
        "forest_edge_3",
        "forest_left_edge",
        "forest_center_1",
        "forest_center_2",
        "forest_one_edge",
        "forest_0_edge",
        "path_i",
        "path_u",
        "path_l_1",
        "path_l_2",
        "path_t",
        "path_x",
        "furnace",
        "furnace_on_1",
        "furnace_on_2",
        "furnace_on_3",
        "workbench",
        "crate",
        "core",
        "stone",
        "coal",
        "copper",
        "iron",
        "flower_1",
        "flower_2",
        "flower_3",
        "bush_1",
        "bush_2",
        "bush_3",
        "stone_ore",
        "coal_ore",
        "copper_ore",
        "copper_ingot",
        "iron_ore",
        "iron_ingot",
        "wood_log",
        "wood_plank",
        "seed",
        "pickaxe",
        "shovel",
        "axe",
        "iron_rod",
        "nail",
        "iron_frame",
        "iron_plate",
        "reinforced_iron_plate",
        "codebot_item",
        "cement",
        "concrete",
        "codebot_1",
        "codebot_2",
        "codebot_3",
        "codebot_4",
        "power",
        "close"
    ]),
    generateAtlas("/assets/trees.png", { w: 2, h: 2 }, { w: 16, h: 32 }, [
        "tree_1",
        "tree_2",
        "tree_3",
        "tree_4",
    ]),
    generateAtlas("/assets/attack_effect_right_1.png", { w: 2, h: 2 }, { w: 128, h: 128 }, [
        "attack_effect_right_1",
        "attack_effect_right_2",
        "attack_effect_right_3",
        "attack_effect_right_4",
    ], {
        player_attack_effect_right_1: ["attack_effect_right_1", "attack_effect_right_2", "attack_effect_right_3", "attack_effect_right_4"]
    }),
    generateAtlas("/assets/attack_effect_right_2.png", { w: 3, h: 3 }, { w: 128, h: 128 }, [
        "attack_effect_right_1",
        "attack_effect_right_2",
        "attack_effect_right_3",
        "attack_effect_right_4",
        "attack_effect_right_5",
        "attack_effect_right_6",
        "attack_effect_right_7",
    ], {
        player_attack_effect_right_2: ["attack_effect_right_1", "attack_effect_right_2", "attack_effect_right_3", "attack_effect_right_4", "attack_effect_right_5", "attack_effect_right_6", "attack_effect_right_7"]
    }),
    generateAtlas("/assets/dash_attack_effect.png", { w: 6, h: 1 }, { w: 128, h: 128 }, [
        "dash_attack_effect_1",
        "dash_attack_effect_2",
        "dash_attack_effect_3",
        "dash_attack_effect_4",
        "dash_attack_effect_5",
        "dash_attack_effect_6",
    ], {
        player_dash_attack_effect: ["dash_attack_effect_1", "dash_attack_effect_2", "dash_attack_effect_3", "dash_attack_effect_4", "dash_attack_effect_5", "dash_attack_effect_6"]
    }),
    generateAtlas("/assets/dash_attack_right.png", { w: 3, h: 4 }, { w: 32, h: 32 }, [
        "dash_attack_right_1",
        "dash_attack_right_2",
        "dash_attack_right_3",
        "dash_attack_right_4",
        "dash_attack_right_5",
        "dash_attack_right_6",
        "dash_attack_right_7",
        "dash_attack_right_8",
        "dash_attack_right_9",
        "dash_attack_right_10",
    ], {
        player_dash_attack_right: ["dash_attack_right_1", "dash_attack_right_2", "dash_attack_right_3", "dash_attack_right_4", "dash_attack_right_5", "dash_attack_right_6", "dash_attack_right_7", "dash_attack_right_8", "dash_attack_right_9", "dash_attack_right_10"]
    }),
    generateAtlas("/assets/dash_attack_top_right.png", { w: 10, h: 1 }, { w: 32, h: 32 }, [
        "dash_attack_top_right_1",
        "dash_attack_top_right_2",
        "dash_attack_top_right_3",
        "dash_attack_top_right_4",
        "dash_attack_top_right_5",
        "dash_attack_top_right_6",
        "dash_attack_top_right_7",
        "dash_attack_top_right_8",
        "dash_attack_top_right_9",
        "dash_attack_top_right_10",
    ], {
        player_dash_attack_top_right: ["dash_attack_top_right_1", "dash_attack_top_right_2", "dash_attack_top_right_3", "dash_attack_top_right_4", "dash_attack_top_right_5", "dash_attack_top_right_6", "dash_attack_top_right_7", "dash_attack_top_right_8", "dash_attack_top_right_9", "dash_attack_top_right_10"]
    }),
    generateAtlas("/assets/dash_attack_bottom_right.png", { w: 10, h: 1 }, { w: 32, h: 32 }, [
        "dash_attack_bottom_right_1",
        "dash_attack_bottom_right_2",
        "dash_attack_bottom_right_3",
        "dash_attack_bottom_right_4",
        "dash_attack_bottom_right_5",
        "dash_attack_bottom_right_6",
        "dash_attack_bottom_right_7",
        "dash_attack_bottom_right_8",
        "dash_attack_bottom_right_9",
        "dash_attack_bottom_right_10",
    ], {
        player_dash_attack_bottom_right: ["dash_attack_bottom_right_1", "dash_attack_bottom_right_2", "dash_attack_bottom_right_3", "dash_attack_bottom_right_4", "dash_attack_bottom_right_5", "dash_attack_bottom_right_6", "dash_attack_bottom_right_7", "dash_attack_bottom_right_8", "dash_attack_bottom_right_9", "dash_attack_bottom_right_10"]
    }),
    generateAtlas("/assets/gui_spritesheet.png", { w: 3, h: 3 }, { w: 30, h: 30 }, [
        "light_square",
        "dark_square",
        "light_frame",
        "dark_frame",
        "scroll",
        "bar",
        "selected_slot",
    ]),
    generateAtlas("/assets/character.png", { w: 5, h: 5 }, { w: 16, h: 16 }, [
        "idle1",
        "idle2",
        "idle_right_1",
        "idle_right_2",
        "idle_left_1",
        "idle_left_2",
        "idle_back_1",
        "idle_back_2",
        "walk_down_1",
        "walk_down_2",
        "walk_down_3",
        "walk_down_4",
        "walk_right_1",
        "walk_right_2",
        "walk_right_3",
        "walk_right_4",
        "walk_left_1",
        "walk_left_2",
        "walk_left_3",
        "walk_left_4",
        "walk_up_1",
        "walk_up_2",
        "walk_up_3",
        "walk_up_4",
    ], {
        player_idle: ["idle1", "idle2"],
        player_idle_right: ["idle_right_1", "idle_right_2"],
        player_idle_left: ["idle_left_1", "idle_left_2"],
        player_idle_back: ["idle_back_1", "idle_back_2"],
        player_walk_down: ["walk_down_1", "walk_down_2", "walk_down_3", "walk_down_4"],
        player_walk_right: ["walk_right_1", "walk_right_2", "walk_right_3", "walk_right_4"],
        player_walk_left: ["walk_left_1", "walk_left_2", "walk_left_3", "walk_left_4"],
        player_walk_up: ["walk_up_1", "walk_up_2", "walk_up_3", "walk_up_4"]
    }),
];

export const getSpritesheets = async () => {
    const spritesheetAssets = await Promise.all(atlas.map((atlas) => Assets.load({
        src: atlas.meta.image,
        data: { scaleMode: "nearest" },
    })));

    const spritesheets = spritesheetAssets.map((spritesheetAsset, i) => new Spritesheet(spritesheetAsset, atlas[i]));

    await Promise.all(spritesheets.map((spritesheet) => spritesheet.parse()));

    return spritesheets;
}
