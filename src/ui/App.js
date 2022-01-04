import React, { useMemo, useRef, useState } from "react"
import cx from "classnames"


const App = ({paramConfig}) => {

    const [showUI, setShowUI] = useState(-1)

    const paramNames = useMemo(
        () => {
            return Object.keys(paramConfig).filter(n => n[0] !== "_")
        },
        []
    )

    const linkRef = useRef(null)



    return (
        <>
            <button ref={ linkRef } className="btn btn-link m-1" onClick={ () => {

                if (showUI < 0)
                {

                    const r = linkRef.current.getBoundingClientRect();
                    setShowUI(window.innerWidth - (r.x + r.width));
                }
                else
                {
                    setShowUI(-1);
                }

            }}>
                config
            </button>

            <div id="param-ui" style={{ display: showUI < 0 ? "none" : null, right: showUI }}>
                <div className="container">
                        {
                            paramNames.map(
                                name => {

                                    const { info, type, range, choices } = paramConfig[name]

                                    const optLock = "lock-" + name

                                    const elems = []
                                    for (let i = 0; i < choices.length; i+=2)
                                    {
                                        const weight = choices[i];
                                        const name = choices[i + 1].name || "Unnamed";

                                        const id = "weight-" + name

                                        elems.push(
                                            <div key={ elems.length } className="form-group">
                                                <label
                                                    className="small"
                                                    htmlFor={ id }
                                                >
                                                    {name}
                                                </label>
                                                <div className="input-group">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        id={ id }
                                                        placeholder="Enter weight"
                                                        title={ "Random weight for " + name }
                                                        value={ weight }
                                                        onChange={ ev => {}}
                                                    />
                                                    <div className="input-group-append">
                                                        <div className="input-group-text">
                                                            <input type="radio"
                                                                   name={ optLock }
                                                                   title={ "Lock option '" + name + "'" }
                                                                   aria-label={ "Lock option '" + name + "'" }
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                    )
                                    }

                                    return (
                                        <div key={ name } className="row">

                                            <div className="col">
                                                <h6
                                                    className="border-top"
                                                >{name}
                                                    <br/>
                                                    <small className="text-muted">
                                                        { info }
                                                    </small>
                                                </h6>
                                                {
                                                    elems
                                                }
                                                <div className="form-group">
                                                    <label
                                                        className="small"
                                                        htmlFor={ "value-override-" + name }
                                                    >
                                                        {
                                                            "Value override for " + name
                                                        }
                                                    </label>
                                                    <div className="input-group">
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            id={ "value-override-" + name }
                                                            placeholder="Override value"
                                                            title={ "Override value for " + name }
                                                            value={ "" }
                                                            onChange={ ev => {}}
                                                        />
                                                        <div className="input-group-append">
                                                            <div className="input-group-text">
                                                                <input type="radio"
                                                                       name={ optLock }
                                                                       title={ "Override value for '" + name + "'" }
                                                                       aria-label={ "Override value for '" + name + "'" }
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label
                                                        className="sr-only"
                                                        htmlFor={ "value-override-" + name }
                                                    >
                                                        {name}
                                                    </label>
                                                    <div className="input-group">
                                                        <div className="input-group-prepend">
                                                            <input
                                                                id={ name + "no-override" }
                                                                value=""
                                                                type="radio"
                                                                className="form-check-input"
                                                                name={ optLock + "-none" }
                                                            />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            id={ "no-override-" + name }
                                                            placeholder="Enter weight"
                                                            readOnly
                                                            title={ "No override for " + name }
                                                            value={ "No override" }
                                                        />
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    );
                                }
                            )
                        }
                </div>


            </div>
        </>
    );
};

export default App;
