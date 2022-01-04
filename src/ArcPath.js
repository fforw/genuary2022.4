import { TAU } from "./constants";
import Color from "./Color";


function randomRadius(config, params)
{
    const minSize = params.radiusMin(config)
    const maxSize = params.radiusMax(config)
    const radiusPower = params.radiusPower(config)
    return minSize + Math.pow(Math.random(), radiusPower) * (maxSize - minSize)

}

function wrap(number)
{
    const n = number/TAU - (number/TAU | 0);
    return n < 0 ? TAU + n * TAU : n * TAU;
}


export default class ArcPath {

    /**
     * current angle
     * @type {number}
     */
    angle = 0;

    /**
     * current position
     *
     * @type {number}
     */
    x = 0;

    /**
     * current position
     *
     * @type {number}
     */
    y = 0;
    /**
     *
     * @type {number}
     */
    r = 0;
    palette;

    reset = false;

    nextAngle = 0;

    clockwise = true;

    lineWidth = 0;
    radiusPower = 0;
    config;
    params;
    step = 0

    alive = true

    constructor(palette, config, params)
    {
        this.palette = palette;
        this.config = config
        this.params = params
        this.init()

    }

    init()
    {
        const { config, params } = this

        let r = randomRadius(params);

        const [x,y,angle] = params.start()

        this.startAngle = angle;
        this.endAngle = wrap(angle + TAU/2);
        this.r = r;
        this.x = x;
        this.y = y;
        this.color = params.stroke(this.palette)
        this.step = params.step(this.palette)
        this.nextColor = params.nextColor(this.palette)
        this.reset = true;
        this.lineWidth = (3 + Math.random() * 3)|0
    }

    draw(ctx)
    {
        const { config, params } = this

        this.reset = false;
        const { width, height } = this.config

        let { startAngle, endAngle, r, x, y, clockwise, color, lineWidth} = this;

        const nextAngle = wrap(-TAU/4 - TAU * 0.35 + TAU * 0.7 * Math.random() );
        let nextRadius =  randomRadius(config, params)

        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color
        ctx.beginPath();
        ctx.arc( x, y, r, startAngle, endAngle, !clockwise )
        ctx.stroke();

        startAngle = wrap(endAngle - TAU/2 );
        x += Math.cos(endAngle) * r
        y += Math.sin(endAngle) * r

        if (y < 0 || y >= height)
        {
            this.init();
        }
        else
        {

            x += Math.cos(startAngle + TAU/2) * nextRadius
            y += Math.sin(startAngle + TAU/2) * nextRadius

            this.clockwise = !clockwise;
            this.startAngle = startAngle;
            this.endAngle = wrap(nextAngle );
            this.r = nextRadius;

            this.x = x
            this.y = y
        }
    }
}
