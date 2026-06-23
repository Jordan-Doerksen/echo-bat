# echo-bat

game · sonar in the dark

A bat in the dark, navigating by sonar. The world only reveals itself where your
pings return — each ping expands outward and lights only the surfaces it reaches,
and the return pitch maps to distance, so you can hear the room before you see it.
Then the dark takes it back.

**No build tools. No frameworks.** Open `index.html`.

## What it is
A single-file canvas game. Echolocation is the whole mechanic: geometry is hidden
until a ping touches it. Procedural WebAudio for the pings (no asset files), touch
+ keyboard, `prefers-reduced-motion` aware.

## Run
```
start index.html        # Windows — or just open it in a browser
```

## Status
Shipped · zero dependencies · ✦ The Glass Archive colophon.

## License
MIT — see LICENSE.
