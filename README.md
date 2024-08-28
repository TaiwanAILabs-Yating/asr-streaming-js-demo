# ASR Demo code in React + TypeScript + Vite

This repository provide the simplest use case of our [Studio ASR API](https://developer.yating.tw/)

You can visit the [live demo website](https://taiwanailabs-yating.github.io/asr-streaming-js-demo/) to see the working example.

## How to start the demo site

1. Provide your API Key into the input box. This key will be used to retrieve auth token for websocket connection.

2. Select your audio input device

3. Hit start and wait for the state to be connected, and start talking to your microphone.

4. Examine the JSON output on the screen. Additional websocket messages are printed to the browser console. Hit F12 to enter developer mode and search for the console tab to see the logs.

## Development

How to run locally:

```
npm install
npm run dev
```

Open http://localhost:5173

## FAQ

**Question: I need js version instead of Typescript version**  
One could use [Official Typescript Playground](https://www.typescriptlang.org/play/) to transpile the `ASR-core.ts` into legit js file. The transpile config should set `target` to `ESNext` for not modifying to much code.

**Question: How to get auth token without user provide the API key?**  
From the system design point of view, ones should establish server endpoint and provide the API key exchange service. In the service, user can be charged by other policy set by server logic.

**Question: Is it possible to use it without React / Typescript / Vite?**  
Yes. The `ASR-core.ts` is zero-dependencies and utilize some modern browser APIs.
