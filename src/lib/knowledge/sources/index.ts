import type { RawDoc } from "../types";
import { collectRecipes, collectNotes } from "./content";
import { collectCricket, collectTravel, collectWork, collectMovement, collectProfile } from "./static";
import { collectPlaces } from "./places";
import { collectFilms } from "./films";
import { collectStrava } from "./strava";
import { collectThoughts } from "./thoughts";

export const ALL_SOURCES: Array<() => Promise<RawDoc[]>> = [
  collectRecipes,
  collectNotes,
  collectCricket,
  collectTravel,
  collectWork,
  collectMovement,
  collectProfile,
  collectPlaces,
  collectFilms,
  collectStrava,
  collectThoughts,
];
