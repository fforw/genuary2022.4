import domready from "domready"
import React from "react";
import ReactDOM from "react-dom"
import "./style.css"
import getRandomPalette from "./getRandomPalette";
import { TAU } from "./constants";
import parameterFactory from "./parameterFactory";
import ArcPath from "./ArcPath";
import App from "./ui/App";


const CONFIG_VERSION = "e55ff7f1-867c-4d5f-b40b-85781a0cad86"


function wrap(number)
{
    const n = number/TAU - (number/TAU | 0);
    return n < 0 ? TAU + n * TAU : n * TAU;
}


const defaultConfig = {
    _v: CONFIG_VERSION,
    count: {
        info: "Total number of arc-paths",
        type: "Number",
        range: [0,10000],
        choices: [
            1, function One() {
                return 1;
            },
            1, function Ten() {
                return 10;
            },
            1, function Fifty() {
                return 50;
            }
        ]
    },

    batch: {
        info: "Number of arc-paths at a time",
        type: "Number",
        range: [0,10],
        choices: [
            1, function One() {
                return 1;
            },
            1, function Two() {
                return 2;
            },
            1, function Five() {
                return 5;
            }
        ],
    },

    lifeTime: {
        info: "How long the arc-path lives",
        type: "Number",
        range: [0,100000],
        choices:[
            1, function Thousand() {
                return 1000;
            }
        ]
    },

    step: {
        info: "How fine the arc is stepped",
        type: "Number",
        range: [0,6.283185307179586],
        choices:[
            1, function Fine() {
                return 0.1;
            }
        ]
    },

    palette: {
        info: "Color palette",
        type: "Palette",
        choices:[
            1, function RandomPaletteFromLib() {
                return getRandomPalette();
            }
        ]
    },

    background: {
        info: "Background color",
        type: "Color",
        choices:[
            1, function BlackOrWhite(palette) {
                return Math.random() < 0.5 ? "#fff" : "#000";
            },
            1, function FromPalette(palette) {
                return palette[0 | Math.random() * palette.length];
            }]
    },

    stroke: {
        info: "Stroke color",
        type: "Color",
        choices:[
            1, function PaletteNoBackground(palette, background) {

                let color;
                do
                {
                    color = palette[0 | Math.random() * palette.length];

                } while (color === background)

                return color;
            },
            0.001, function Palette(palette, background) {

                return palette[0 | Math.random() * palette.length];
            }
        ]
    },

    start: {
        info: "Start position and angle",
        type: "Tuple",
        choices: [
            1, function Center(config, params) {
                const angle = TAU * Math.random()
                return [
                    config.width / 2,
                    config.height / 2,
                    angle
                ]
            },
            1, function Thirds(config, params) {
                const angle = TAU * Math.random()
                const h = Math.random() < 0.5
                const v = Math.random() < 0.5
                return [
                    h ? config.width / 3 : 2 * config.width / 3,
                    v ? config.height / 3 : 2 * config.height / 3,
                    angle
                ]
            },
            1, function Edges(config, params) {
                const angle = TAU * Math.random()

                const [sx, sy, vx, vy] = config.edges[(wrap(angle + TAU / 8) / (TAU / 4)) | 0]

                let r = params.radius.repeat(config)

                let x;
                if (vx !== 0)
                {
                    const range = vx - r * 2;
                    x = sx - range / 2 + range * Math.random();
                }
                else
                {
                    x = sx + 0;
                }
                let y;
                if (vy !== 0)
                {
                    const range = vy - r * 2;
                    y = sy - range / 2 + range * Math.random();
                }
                else
                {
                    y = sy + 0;
                }
                return [x, y, angle]

            }
        ]
    },

    radius: {
        type: "Number",
        range: [0, 1],
        choices: [
            1, function Gen18Vines(config) {
                const {width, height} = config

                const size = Math.min(width, height) * 0.06;
                const rnd = Math.random();
                return size * 0.2 + Math.pow(rnd, 0.5 + 1.5 * Math.random()) * size * 0.8
            },
            1, function Large(config) {
                const {width, height} = config

                const size = Math.min(width, height) * 0.12;
                const rnd = Math.random();
                return size * 0.2 + Math.pow(rnd, 0.5 + 1.5 * Math.random()) * size * 0.8
            },
            1, function Larger(config) {
                const {width, height} = config

                const size = Math.min(width, height) * 0.2;
                const rnd = Math.random();
                return size * 0.2 + Math.pow(rnd, 0.5 + 1.5 * Math.random()) * size * 0.8
            },
            1, function Huge(config) {
                const {width, height} = config

                const size = Math.min(width, height) * 0.4;
                const rnd = Math.random();
                return size * 0.2 + Math.pow(rnd, 0.5 + 1.5 * Math.random()) * size * 0.8
            }
        ]
    },
    
    colorStep: {
        info: "Steps until the next color is chosen",
        type: "Number",
        range: [0,10000],
        choices: [
            1, function Million() {
                return 100000;
            },
            1, function One() {
                return 1;
            },
            1, function Some() {
                return 2 + Math.random() * 8;
            }
        ]
    },

    lineStep: {
        info: "Steps until the next lineWidth is chosen",
        type: "Number",
        range: [0,10000],
        choices: [
            1, function Million() {
                return 100000;
            },
            1, function One() {
                return 1;
            },
            1, function Some() {
                return 2 + Math.random() * 8;
            }
        ]
    },

    lineWidth: {
        info: "Line width for the arc drawing. Can be changed per step",
        type: "Number",
        range: [0,10000],
        choices: [
            1, function RandomByRadius(radius) {
                return 1 + radius / 2 * Math.random();
            },
            1, function byRadius(radius) {
                return 1 + radius / 2 * Math.random();
            },
        ]
    }
};

const config = {
    width: 0,
    height: 0
};

/**
 * @type CanvasRenderingContext2D
 */
let ctx;
let canvas;
let paths = [];

let total, gone 

const stepsPerFrame = 10

domready(
    () => {

        canvas = document.getElementById("screen");
        ctx = canvas.getContext("2d");

        const width = (window.innerWidth) | 0;
        const height = (window.innerHeight) | 0;

        config.width = width;
        config.height = height;
        config.alive = 0
        config.gone = 0

        canvas.width = width;
        canvas.height = height;
        config.edges = [
            [   width,  height/2,        0, height],
            [ width/2,  height,    width,        0],
            [       0,  height/2,        0, height],
            [ width/2,         0,  width,        0],
        ]

        const params = parameterFactory(defaultConfig, null)

        const paint = () => {

            paths = [];

            total = params.count()
            gone = 0
            const batch = params.batch()

            const palette = params.palette()
            const background = params.background(palette)
            ctx.fillStyle = background;
            ctx.fillRect(0,0, width, height);

            for (let i=0; i < batch; i++)
            {
                paths.push(new ArcPath(palette, config, params, background))
            }

            requestAnimationFrame(animate)
        }

        const animate = () => {
            for (let i=0; i < stepsPerFrame; i++)
            {
                if (paths && paths.length)
                {
                    for (let i=0; i < stepsPerFrame; i++)
                    {

                        for (let j = 0; j < paths.length; j++)
                        {
                            if (!paths[j].draw(ctx))
                            {
                                gone++;
                            }
                        }

                        if (gone >= total)
                        {
                            break;
                        }
                    }
                }
            }

            if (gone < total)
            {
                requestAnimationFrame(animate)
            }
        }
        

        //
        // ReactDOM.render(
        //     <App
        //         paramConfig={ defaultConfig }
        //     />,
        //     document.getElementById("ui-root"),
        //     () => {
        //
                    canvas.addEventListener("click", paint, true)
                    paint()
//        })
    }
);

export default {
    config: defaultConfig
}
