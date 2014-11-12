# Rogue

Boo boo bla bla

## TO DO

Techy stuff
- Mousemove, grrr. 
- Fix div position on game initialization and player (re) positioning

Game stuff
- world map, fits a single screen. is a zoomed out version of bigger one
- every world map tile is 1 screen as 'Land', which is a giant continuous map. 
  this should be made screen by screen though to prevent generating a div with millions of node. 
- improve dungeons. 
- Add different types of landscapes

## IDEAS

Techy stuff
- Move some of the generation server side? This would be faster in Node. 
- Use sockets to stream messages to the client regarding creation status?
- Use sockets to stream 'endless worlds'? Chunk creation of planets/overworlds

Several 'levels'
- world map, with seas, forests, plains etc. Animated blocky clouds on the sides?
- zoomed into a plain, forest whatever, an 'overworld' to walk around in and discover things. towns, caves
- under world. dungeons and caves

All the usual jazz like stats, items, magics.

Extend lightsource to have two radiusses?

Extend AStar to break off after n length

Auto pilot mode. Click a tile, display a trail. Then move player to that tile. If enemy encounter, break auto pilot.