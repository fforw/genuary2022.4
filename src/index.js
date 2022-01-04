import domready from "domready"
import React from "react";
import ReactDOM from "react-dom"
import "./style.css"
import getRandomPalette from "./getRandomPalette";
import { TAU } from "./constants";
import parameterFactory, { CONFIG_VERSION } from "./parameterFactory";
import ArcPath from "./ArcPath";


const config = {
    width: 0,
    height: 0
};

/**
 * @type CanvasRenderingContext2D
 */
let ctx;
let canvas;

const defaultConfig = {
    _v: CONFIG_VERSION,
    count: {
        info: "Total number of arc-paths",
        type: "Number",
        range: [0,10000],
        choices: [
            1, () => 1,
            1, () => 10,
            1, () => 50
        ]
    },

    batch: {
        info: "Number of arc-paths at a time",
        type: "Number",
        range: [0,10],
        choices: [
            1, () => 1,
            1, () => 2,
            1, () => 5
        ],
    },

    lifeTime: {
        info: "How long the arc-path lives",
        type: "Number",
        range: [0,100000],
        choices:[
            1, () => 100
        ]
    },

    step: {
        info: "How fine the arc is stepped",
        type: "Number",
        range: [0,6.283185307179586],
        choices:[
            1, () => 0.1
        ]
    },

    palette: {
        info: "Color palette",
        type: "Palette",
        choices:[
            1, () => getRandomPalette()
        ]
    },

    background: {
        info: "Background color",
        type: "Color",
        choices:[
            1, palette => Math.random() < 0.5 ? "#fff" : "#000",
            1, palette => palette[0|Math.random() * palette.length]]
    },

    stroke: {
        info: "Stroke color",
        type: "Color",
        choices:[
            1, palette => palette[0|Math.random() * palette.length]]
    },

    start: {
        info: "Start position and angle",
        type: "Tuple",
        choices: [1, () => {

            const angle = TAU/4//Math.random() * TAU
            const [sx, sy, vx, vy] = config.edges[ (wrap(angle + TAU/8) / (TAU/4))|0]

            let x;
            if (vx !== 0)
            {
                const range = vx - r * 2;
                x = sx - range/2 + range * Math.random();
            }
            else
            {
                x = sx + 0;
            }
            let y;
            if (vy !== 0)
            {
                const range = vy - r * 2;
                y = sy -range/2 + range * Math.random();
            }
            else
            {
                y = sy + 0;
            }

            return [x,y, angle]

        } ]
    },

    radiusPower: {
        info: "Power applied to the radius randomness",
        type: "Number",
        range: [0,5],
        choices: [1, () => 0.5 + 1.5 * Math.random() ]
    },

    radiusMin: {
        info: "Minimum Radius",
        type: "Number",
        range: [0,1],
        choices: [1, config => Math.min(config.width, config.height) * 0.004 ]
    },

    radiusMax: {
        info: "Maximum Radius",
        type: "Number",
        range: [0,1],
        choices: [1, config => Math.min(config.width, config.height) * 0.002 ]
    },

    nextColor: {
        info: "Steps until the next color is chosen",
        type: "Number",
        range: [0,10000],
        choices: [1, () => 0 ]
    }
};


let paths = [];

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

        const params = parameterFactory("genuary2022.4", defaultConfig, CONFIG_VERSION, true)

        const paint = () => {

            paths = [];

            let initialCount = count

            let count = params.count()
            const batch = params.batch()

            const background = params.background(palette)
            ctx.fillStyle = "#000";
            ctx.fillRect(0,0, width, height);

            const palette = params.palette()
            for (let i=0; i < batch; i++)
            {
                paths.push(new ArcPath(palette, config, params))
            }


        }

        const animate = () => {

            if (paths && paths.length)
            {
                for (let i = 0; i < paths.length; i++)
                {
                    paths[i].draw(ctx)
                }

            }

            if (gone < initialCount)
            {
                requestAnimationFrame(animate)
            }
        }
        
        requestAnimationFrame(animate)
        

        ReactDOM.render(
            <>

            </>,
            document.getElementById("ui-root"),
            () => {

                    canvas.addEventListener("click", paint, true)
                    paint()
            }

        )
    }
);
