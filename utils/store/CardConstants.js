
export const nationOption = [
  { id: "n1", file: "none.png" },
  { id: "n2", file: "red.png" },
  { id: "n3", file: "blue.png" },
  { id: "n4", file: "gray.png" },
  { id: "n5", file: "yellow.png" },
  { id: "n6", file: "green.png" },
  { id: "n7", file: "pink.png" },
];

export const clanOption = {
  "none.png": [
    { id: "c1", file: "race.png" },
    { id: "c2", file: "clan/CE.png" }
  ],
  "red.png": [
    { id: "c3", file: "clan/KR.png" },
    { id: "c4", file: "clan/NT.png" },
    { id: "c5", file: "clan/TK.png" },
    { id: "c6", file: "clan/MM.png" },
    { id: "c7", file: "clan/NM.png" },
  ],
  "blue.png": [
    { id: "c8", file: "clan/SB.png" },
    { id: "c9", file: "clan/DI.png" },
    { id: "c10", file: "clan/PM.png" },
    { id: "c11", file: "clan/GC.png" },
  ],
  "gray.png": [
    { id: "c12", file: "clan/NG.png" },
    { id: "c13", file: "clan/DP.png" },
    { id: "c14", file: "clan/LJ.png" },
  ],
  "yellow.png": [
    { id: "c15", file: "clan/RD.png" },
    { id: "c16", file: "clan/OT.png" },
    { id: "c17", file: "clan/AF.png" },
    { id: "c18", file: "clan/SP.png" },
    { id: "c19", file: "clan/GP.png" },
    { id: "c20", file: "clan/GS.png" },
  ],
  "green.png": [
    { id: "c21", file: "clan/GB.png" },
    { id: "c22", file: "clan/AQ.png" },
    { id: "c23", file: "clan/NN.png" },
    { id: "c24", file: "clan/GN.png" },
    { id: "c25", file: "clan/MC.png" },
  ],
  "pink.png": [
    { id: "c26", file: "clan/BT.png" },
  ],
};

export const typeOption = [
  { id: "b1", file: "base_normal.png" },
  { id: "b2", file: "base_trigger.png" },
  { id: "b3", file: "base_g.png" },
  { id: "b4", file: "base_normal.png/token" },
  { id: "b5", file: "base_encounter.png" },
  { id: "b6", file: "base_g.png/encounter" },
  { id: "b7", file: "base_normal_order.png" },
  { id: "b8", file: "base_blitz.png" },
  { id: "b9", file: "base_set.png" },
  { id: "b10", file: "base_set.png/token" },
  { id: "b11", file: "base_trigger_o.png" },
  { id: "b12", file: "base_blitz_trigger_o.png" },
  { id: "b13", file: "base_set_trigger_o.png" },
  { id: "b14", file: "base_ticket.png/marker" },
  { id: "b15", file: "base_ticket.png" },
  { id: "b16", file: "base_crest.png" },
  { id: "b17", file: "base_crest.png/encounter" },
  { id: "b18", file: "base_crest.png/ride_deck" },
];

export const passiveOption = [
  { id: "p0", file: "" },
  { id: "p1", file: "boost.png" },
  { id: "p2", file: "intercept.png" },
  { id: "p3", file: "twindrive.png" },
  { id: "p4", file: "tripledrive.png" },
];

export const addPassiveOption = {
  0: [{ id: "u0", file: "" }],
  1: [
    { id: "u0", file: "" },
    { id: "u1", file: "persona_ride.png" },
    { id: "u2", file: "ace_unit.png" },
  ],
  2: [
    { id: "u0", file: "" },
    { id: "u_o1", file: "regalis_piece.png" },
  ]
}

export const triggerOption = [
  { id: "t1", file: "over.png" },
  { id: "t2", file: "critical.png" },
  { id: "t3", file: "draw.png" },
  { id: "t4", file: "front.png" },
  { id: "t5", file: "heal.png" },
];

export const typeLabel = {
  "base_normal.png": "normal.png",
  "base_encounter.png": "normal.png",
  "base_g.png": "g.png",
  "base_g.png/encounter": "g.png",
  "base_normal.png/token": "token.png",
  "base_trigger.png": "trigger.png",
  "base_normal_order.png": "order_normal.png",
  "base_blitz.png": "blitz.png",
  "base_set.png": "set.png",
  "base_set.png/token": "token_set.png",
  "base_ticket.png/marker": "marker.png",
  "base_ticket.png": "",
  "base_crest.png": "crest.png",
  "base_crest.png/encounter": "crest.png",
  "base_crest.png/ride_deck": "ride_deck.png",
  "base_trigger_o.png": "trigger_o.png",
  "base_blitz_trigger_o.png": "blitz_trigger_o.png",
  "base_set_trigger_o.png": "set_trigger_o.png"
};

export const RACE_OVERLAY = "race.png";

export const getShieldOverlay = (shieldCheck, shield) => {
  if (!shieldCheck) return null;
  return shield > 0 ? "normal.png" : "sentinel.png";
};

export const getBoxPath = (boxLine, maxLine, crest) => {
  if (boxLine > maxLine) return `/assets/box/box${maxLine}${crest ? "_c" : ""}.png`;
  if (boxLine === 0) return "";
  return `/assets/box/box${boxLine}${crest ? "_c" : ""}.png`;
};