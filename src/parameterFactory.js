export function weightedRandomFn(choices)
{
    let sum = 0;

    for (let i = 0; i < choices.length; i += 2)
    {
        const weight = choices[i];
        sum += weight;
    }

    return (rnd = Math.random()) => {

        let val = rnd * sum;

        const length = choices.length - 2;
        let i;
        for (i = 0; i < length; i += 2)
        {
            const weight = choices[i    ];
            const value = choices[i + 1];

            val -= weight;
            if (val < 0)
            {
                // return weight random function ref
                return value
            }
        }

        // return weight random function ref
        return choices[i + 1]
    }
}

function parse(str, version)
{
    if (str)
    {
        let data;
        try
        {
            data = JSON.parse(str);
        }
        catch(e)
        {
            console.error("Error parsing localStorage state", e)
        }
        if (data && typeof data === "object" && data._v === version && data.weights && data.overrides)
        {
            return data;
        }
        console.warn("Ignoring invalid/outdated localStorage data")
    }
    return {
        weights: null,
        overrides:null
    };
}


function paramFactory(name, choices, overrideEntry, debug)
{
    const wr = (!overrideEntry || overrideEntry.choice !== undefined) && weightedRandomFn(choices);

    return () => {

        if (overrideEntry)
        {
            if (debug)
            {
                console.log("Param '" + name + "': Override = ", override)
            }
            return () => getOverrideValue(overrideEntry, wr)
        }

        const result = wr()
        if (debug)
        {
            console.log("Param '" + name + "': weighted random result = ", result)
        }
        return result

    }
}

function getFromLocal()
{
    let weights, overrides
    const storageKey = "params-" + name
    if (typeof localStorage === "object")
    {
        ({ weights, overrides } = parse(localStorage.getItem(storageKey), version))
    }

}


function getOverrideValue(entry, wrFn)
{
    if (entry.value !== undefined)
    {
        return entry.value
    }
    return wrFn(entry.choice)()
}


export default function parameterFactory(paramConfig, overrides, debug = false)
{


    let weights, overrideMap;
    if (overrides)
    {
        ({ weights, overrides : overrideMap } = overrides)
    }


    if (weights)
    {
        for (let name in weights)
        {
            if (name[0] !== "_" && weights.hasOwnProperty(name) && paramConfig.hasOwnProperty(name))
            {
                const array = weights[name];
                const param = paramConfig[name].choices;

                if (array.length * 2 === param.length)
                {
                    for (let i = 0; i < array.length; i++)
                    {
                        param[i*2] = array[i];
                    }
                }
            }
        }
    }

    const params = {}
    for (let name in paramConfig)
    {
        if (name[0] !== "_")
        {
            if (paramConfig.hasOwnProperty(name))
            {
                const entry = paramConfig[name];

                const choiceFn = paramFactory(name, entry.choices, overrideMap && overrideMap.hasOwnProperty(name) && overrideMap[name], debug);

                const factory = (...args) => {
                    const fn = choiceFn(...args);
                    factory.repeat = fn
                    return fn();
                }
                params[name] = factory
            }
        }
    }


    return params;
}
