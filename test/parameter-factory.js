import { describe, it } from "mocha";
import assert from "power-assert";
import parameterFactory from "../src/parameterFactory";

const isCloseTo = (a,b) => {
    // XXX: dunno if 1.5% deviation is really the max.
    const deviation = Math.abs(1 - a / b);
    //console.log("deviation", deviation)
    return deviation < 0.015
}

describe("ParameterFactory", function(){
	it("provides rule-based randomly generated parameters", function()
	{

        const p = parameterFactory( {
            foo: {
                info: "Test function",
                choices: [1, () => 1000,1, () => 2000,1, () => 3000]
            }

        })

        const result = p.foo();
        assert(result === 1000 || result === 2000 || result === 3000)

        // params.name.repeat() allows to reevaluate latest weight function
        assert(p.foo.repeat() === result)
    });

    it("chooses according to random weights", function()
	{

        const p = parameterFactory( {
            foo: {
                info: "Test function",
                choices: [1, () => 1000,2, () => 2000, 3, () => 3000]
            }

        })

        const a=[0,0,0]
        const repeat = 100000;
        for (let i=0; i < repeat; i++)
        {
            a[p.foo()/1000-1]++
        }

        a.forEach(n => (n/repeat))



        assert(isCloseTo(a[0], repeat    /6))
        assert(isCloseTo(a[1], repeat * 2/6))
        assert(isCloseTo(a[2], repeat * 3/6))
	});

    it("allows overriding parameters", function() {
        const p = parameterFactory({
                foo: {
                    info: "Test function",
                    choices: [1, () => 1000, 2, () => 2000, 3, () => 3000]
                }

            },
            {
                overrides: { foo: { value : 12 } }
            })

        assert(p.foo() === 12)

        const p2 = parameterFactory({
                foo: {
                    info: "Test function",
                    choices: [1, () => 1000, 2, () => 2000, 3, () => 3000]
                }

            },
            {
                // XXX: the choice values must 0 to 1 matching the current weights (here the first entry has 1/6th chance)
                overrides: { foo: { choice : 1/6 } }
            })

        const repeat = 100;
        for (let i=0; i < repeat; i++)
        {
            assert(p2.foo() === 2000)
        }

    });

    it("allows overriding parameter weights", function() {
        const p = parameterFactory({
                foo: {
                    info: "Test function",
                    choices: [1, () => 1000, 2, () => 2000, 3, () => 3000]
                }

            },
            {
                weights: { foo: [1,1,1] }
            })

        const a=[0,0,0]
        const repeat = 100000;
        for (let i=0; i < repeat; i++)
        {
            a[p.foo()/1000-1]++
        }

        a.forEach(n => (n/repeat))

        assert(isCloseTo(a[0], repeat/3))
        assert(isCloseTo(a[1], repeat/3))
        assert(isCloseTo(a[2], repeat/3))
    });

});
