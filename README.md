# Sizzle Rush

A lunch-rush cooking game. Top-down 2D canvas, plain static files, no
network requests. Play it in a desktop browser.

## How to play

Orders arrive on the ticket board. Fetch ingredients from the pantry
crates, chop the greens on the board, grill patties/eggs/bacon on the
grill, build the dish on an assembly plate, and serve it at the window
before the ticket's patience runs out.

- **WASD / arrows** — move the chef
- **E** — pick up, put down, grill, plate (hold E at the board to chop)
- **Space** — serve at the window
- **Q** — bin what you're holding
- **Mouse** — click to walk; click a station to walk to it and use it
- **P / Esc** — pause, **M** — mute, **R** — restart, **Enter** — start

Five recipes (Classic Burger, Cheese Melt, Garden Salad, Sunrise Stack,
Veggie Crunch). Fast serves earn tips; serving the wrong dish or letting
a ticket walk out costs points and resets your combo. The round lasts
150 seconds; beat 900 points to win the shift. Orders follow a seeded
schedule, so the same seed always serves the same rush.

## Run it

```
node serve.ts            # play at http://localhost:8080
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # hand-in to out/
```

Screenshots are staged deterministically: `?shot=start|cover|rush|end&seed=1`.
