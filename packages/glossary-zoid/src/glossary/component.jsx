/* @flow */
/* @jsx jsxDom */

import { create } from 'zoid';

export const Glossary = create({

    tag: 'glossary-zoid',

    defaultEnv: 'demo',

    url: {
        demo:       'http://localhost:3000/',
        test:       '/base/test/windows/glossary/index.htm',
        production: 'https://glossary.concord.org'
    },

    domain: {
        test: 'mock://glossary.concord.org'
    },

    dimensions: {
        width:  '640px',
        height: '480px'
    },

    props: {

        word: {
            type: 'string',
            required: true
        },

        authorDefinition: {
            type: 'string',
            required: true
        },

        userDefinition: {
            type: 'string',
            required: false
        },

        onSubmit: {
            type: 'function',
            required: true
        }
    },

    defaultContext: __DEFAULT_CONTEXT__,

    contexts: {
        iframe: true,
        popup:  __POPUP_SUPPORT__
    },

    // eslint-disable-next-line no-unused-vars
    prerenderTemplate({ jsxDom }) : HTMLElement {
        return (
            <html>
                <head>
                    <style>
                        {`
                        html, body {
                            width: 100%;
                            height: 100%;
                            overflow: hidden;
                            top: 0;
                            left: 0;
                            margin: 0;
                            text-align: center;
                        }

                        .spinner {
                            position: absolute;
                            max-height: 60vmin;
                            max-width: 60vmin;
                            height: 40px;
                            width: 40px;
                            top: 50%;
                            left: 50%;
                            transform: translateX(-50%) translateY(-50%);
                            z-index: 10;
                        }

                        .spinner .loader {
                            height: 100%;
                            width: 100%;
                            box-sizing: border-box;
                            border: 3px solid rgba(0, 0, 0, .2);
                            border-top-color: rgba(33, 128, 192, 0.8);
                            border-radius: 100%;
                            animation: rotation .7s infinite linear;

                        }

                        @keyframes rotation {
                            from {
                                transform: rotate(0deg)
                            }
                            to {
                                transform: rotate(359deg)
                            }
                        }
                    `}
                    </style>
                </head>
                <body>
                    <div class="spinner">
                        <div id="loader" class="loader"></div>
                    </div>
                </body>
            </html>
        );
    }
});
