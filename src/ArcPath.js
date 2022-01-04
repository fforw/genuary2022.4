import { TAU } from "./constants";


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

    clockwise = true;

    lineWidth = 0;
    radiusPower = 0;
    config;
    params;
    step = 0

    alive = true

    constructor(palette, config, params,background)
    {
        this.palette = palette;
        this.background = background
        this.config = config
        this.params = params
        this.init()

    }

    init()
    {
        const { config, params } = this

        let r = params.radius(config);

        const [x,y,angle] = params.start(config,params)

        this.startAngle = angle;
        this.endAngle = wrap(angle + TAU/2);
        this.r = r;
        this.x = x;
        this.y = y;
        this.color = params.stroke(this.palette, this.background)
        this.step = params.step()
        this.colorStep = params.colorStep(params)
        this.lifeTime = params.lifeTime(this.palette)
        this.lineWidth = params.lineWidth(r)
        this.lineStep = params.lineStep(params)
    }

    draw(ctx)
    {
        const { config, params } = this


        let { startAngle, endAngle, r, x, y, clockwise, color, lineWidth, step} = this;

        if (!clockwise)
        {
            step = -step
        }


        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color
        ctx.beginPath();
        ctx.arc( x, y, r, startAngle, startAngle + step, !clockwise )
        ctx.stroke();

        if (this.colorStep !== 0 && this.colorStep-- === 1)
        {
            this.color = params.stroke(this.palette)
            this.colorStep = this.params.colorStep.repeat()
        }

        if (this.lineStep !== 0 && this.lineStep-- === 1)
        {
            this.lineWidth = params.lineWidth(r)
            this.lineStep = this.params.lineStep.repeat()
        }

        if (this.lifeTime-- < 0)
        {
            return false
        }
        else
        {
            if (Math.abs(endAngle - (startAngle + step)) > this.step)
            {
                ctx.beginPath();
                ctx.arc( x, y, r, startAngle + step, endAngle, !clockwise )
                ctx.stroke();
                this.startAngle = wrap(startAngle + step);
            }
            else
            {
                const nextAngle = wrap(TAU * Math.random() );
                let nextRadius =  params.radius.repeat(config)

                startAngle = wrap(endAngle - TAU/2 );
                x += Math.cos(endAngle) * r
                y += Math.sin(endAngle) * r

                x += Math.cos(startAngle + TAU/2) * nextRadius
                y += Math.sin(startAngle + TAU/2) * nextRadius

                this.startAngle = startAngle;
                this.x = x
                this.y = y
                this.clockwise = !clockwise;
                this.endAngle = wrap(nextAngle );
                this.r = nextRadius;

            }


            return true
        }
    }
}
